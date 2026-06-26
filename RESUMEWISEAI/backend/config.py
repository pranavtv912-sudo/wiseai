"""
Configuration file for ResumeWise AI Backend
Handles environment-based configurations for development, testing, and production
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = False
    TESTING = False
    
    # Database Configuration - SQLite by default
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///resumewise.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Engine options are MySQL-specific and incompatible with SQLite
    # SQLALCHEMY_ENGINE_OPTIONS = {
    #     'pool_recycle': 3600,
    #     'pool_pre_ping': True,
    #     'pool_size': 10,
    #     'max_overflow': 20,
    #     'connect_args': {
    #         'charset': 'utf8mb4',
    #     }
    # }
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=90)
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
    
    # External API Keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY', '')
    ADZUNA_API_KEY = os.getenv('ADZUNA_API_KEY', '')
    ADZUNA_API_ID = os.getenv('ADZUNA_API_ID', '')
    EMAILJS_API_KEY = os.getenv('EMAILJS_API_KEY', '')
    EMAILJS_PRIVATE_KEY = os.getenv('EMAILJS_PRIVATE_KEY', '')
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:5000').split(',')
    
    # Spacy Model
    SPACY_MODEL = 'en_core_web_sm'
    
    # Pagination
    ITEMS_PER_PAGE = 20


class DevelopmentConfig(Config):
    """Development environment configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = True


class TestingConfig(Config):
    """Testing environment configuration"""
    TESTING = True
    # Use a dedicated SQLite test database
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'TEST_DATABASE_URL',
        'sqlite:///resumewise_test.db'
    )
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)


class ProductionConfig(Config):
    """Production environment configuration"""
    DEBUG = False
    # In production, ensure all environment variables are properly set


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get the appropriate configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
