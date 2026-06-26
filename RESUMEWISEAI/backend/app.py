"""
ResumeWise AI - Smart Resume Analyzer for Freshers
Main Application File

This is the entry point for the Flask application. It initializes the app,
registers all routes, sets up error handling, and starts the development server.
"""

import os
from dotenv import load_dotenv

load_dotenv()

import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text

from config import get_config
from models import db
from routes import (
    auth_routes,
    resume_routes,
    analysis_routes,
    roadmap_routes,
    interview_routes,
    report_routes,
    progress_routes,
    history_routes,
    roles_routes,
    jd_match_routes,
    chat_routes,
    resume_builder_routes,
    dashboard_routes
)


def verify_db_connection(app):
    """
    Verify that the database is reachable before proceeding.
    Exits with a descriptive error message if the connection cannot be established.
    """
    db_url = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    try:
        with db.engine.connect() as connection:
            connection.execute(text('SELECT 1'))
        print('[OK] Connected to database successfully')
        print(f'  Database: {db_url.split("@")[-1] if "@" in db_url else db_url}')
    except Exception as e:
        error_msg = str(e)
        print('\n[ERROR] Failed to connect to database!')
        print(f'  Connection URL: {db_url.split("@")[-1] if "@" in db_url else db_url}')
        print(f'  Reason: {error_msg}')
        import sys
        sys.exit(1)


def create_app(config_name=None):
    """
    Application factory function
    
    Args:
        config_name: Configuration environment (development, testing, production)
        
    Returns:
        Flask application instance
    """
    
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')
    
    config = get_config()
    app.config.from_object(config)
    
    # Initialize database
    db.init_app(app)
    
    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    # Register blueprints
    app.register_blueprint(auth_routes)
    app.register_blueprint(resume_routes)
    app.register_blueprint(analysis_routes)
    app.register_blueprint(roadmap_routes)
    app.register_blueprint(interview_routes)
    app.register_blueprint(report_routes)
    app.register_blueprint(progress_routes)
    app.register_blueprint(history_routes)
    app.register_blueprint(roles_routes)
    app.register_blueprint(jd_match_routes)
    app.register_blueprint(chat_routes)
    app.register_blueprint(resume_builder_routes)
    app.register_blueprint(dashboard_routes)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {
            'success': False,
            'message': 'Resource not found',
            'data': None
        }, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {
            'success': False,
            'message': 'Internal server error',
            'data': None
        }, 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return {
            'success': False,
            'message': 'Bad request',
            'data': None
        }, 400
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return {
            'success': True,
            'message': 'Server is running',
            'data': {
                'status': 'healthy',
                'version': '1.0.0'
            }
        }, 200
    
    # Verify database connection and create tables
    with app.app_context():
        verify_db_connection(app)
        try:
            db.create_all()
            print('[OK] Database tables created/verified successfully')
        except Exception as e:
            print(f'[ERROR] Error creating database tables: {str(e)}')
    
    # Setup logging
    setup_logging(app)
    
    return app


def setup_logging(app):
    """Setup application logging"""
    
    log_level = logging.INFO
    
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # File handler
    file_handler = logging.FileHandler('logs/resumewise.log')
    file_handler.setLevel(log_level)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    ))
    
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)
    app.logger.setLevel(log_level)


# Create application instance
app = create_app()


if __name__ == '__main__':
    """
    Run the development server
    
    To run:
        python app.py
        
    Or with custom host/port:
        python app.py --host 0.0.0.0 --port 5000
    """
    
    print("=" * 66)
    print("  ResumeWise AI - Smart Resume Analyzer")
    print("  Starting Backend Server")
    print("=" * 66)
    
    debug = app.config.get('DEBUG', False)
    
    print(f'Environment: {os.getenv("FLASK_ENV", "development")}')
    print(f'Debug Mode: {debug}')
    print(f'Database: {app.config.get("SQLALCHEMY_DATABASE_URI")}')
    print()
    
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=debug,
            use_reloader=debug
        )
    except KeyboardInterrupt:
        print('\n[OK] Server stopped gracefully')
    except Exception as e:
        print(f'✗ Error starting server: {str(e)}')
