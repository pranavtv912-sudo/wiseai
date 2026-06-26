"""
Database Initialization Script
Creates tables and initializes the database
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from models import User, Resume, Analysis, Report


def init_database():
    """Initialize the database with all tables"""
    
    with app.app_context():
        print('[INFO] Initializing database...')
        
        try:
            # Create all tables
            db.create_all()
            print('[OK] Database tables created successfully')
            
            # Check if any data exists
            user_count = User.query.count()
            print(f'[OK] Users table: {user_count} records')
            
            resume_count = Resume.query.count()
            print(f'[OK] Resumes table: {resume_count} records')
            
            analysis_count = Analysis.query.count()
            print(f'[OK] Analyses table: {analysis_count} records')
            
            report_count = Report.query.count()
            print(f'[OK] Reports table: {report_count} records')
            
            print('\n[OK] Database initialization completed!')
            
        except Exception as e:
            print(f'[ERROR] Error initializing database: {str(e)}')
            sys.exit(1)


def seed_database():
    """Add sample data to database (optional)"""
    
    with app.app_context():
        try:
            # Check if demo user already exists
            demo_user = User.query.filter_by(email='demo@resumewise.ai').first()
            
            if demo_user:
                print('[OK] Demo user already exists')
                return
            
            # Create demo user
            demo_user = User(
                name='Demo User',
                email='demo@resumewise.ai',
                phone='+1234567890',
                bio='Software Developer interested in AI',
                target_role='Python Developer'
            )
            demo_user.set_password('DemoPassword123!')
            
            db.session.add(demo_user)
            db.session.commit()
            
            print('[OK] Demo user created successfully')
            print('  Email: demo@resumewise.ai')
            print('  Password: DemoPassword123!')
            
        except Exception as e:
            db.session.rollback()
            print(f'[ERROR] Error seeding database: {str(e)}')


def drop_all_tables():
    """Drop all tables (use with caution!)"""
    
    with app.app_context():
        try:
            response = input('[WARNING] WARNING: This will delete all data! Continue? (yes/no): ')
            
            if response.lower() == 'yes':
                db.drop_all()
                print('[OK] All tables dropped successfully')
            else:
                print('[INFO] Operation cancelled')
        
        except Exception as e:
            print(f'[ERROR] Error dropping tables: {str(e)}')


def reset_database():
    """Reset database (drop and recreate)"""
    
    with app.app_context():
        try:
            response = input('[WARNING] WARNING: This will delete all data! Continue? (yes/no): ')
            
            if response.lower() == 'yes':
                print('Dropping all tables...')
                db.drop_all()
                print('[OK] Tables dropped')
                
                print('Creating new tables...')
                db.create_all()
                print('[OK] Tables created')
                
                print('Adding sample data...')
                seed_database()
                
                print('\n[OK] Database reset completed!')
            else:
                print('[INFO] Operation cancelled')
        
        except Exception as e:
            print(f'[ERROR] Error resetting database: {str(e)}')


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Database initialization script')
    parser.add_argument(
        'action',
        nargs='?',
        default='init',
        choices=['init', 'seed', 'drop', 'reset'],
        help='Action to perform (default: init)'
    )
    
    args = parser.parse_args()
    
    if args.action == 'init':
        init_database()
    elif args.action == 'seed':
        init_database()
        seed_database()
    elif args.action == 'drop':
        drop_all_tables()
    elif args.action == 'reset':
        reset_database()
