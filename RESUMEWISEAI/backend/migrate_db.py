"""
Database Migration Script: SQLite -> MySQL
Migrates the entire database schema and data from resumewise.db to MySQL,
creates the database if not exists, and updates the .env configuration.
"""

import os
import sys
import json
from pathlib import Path

# Add the current directory to sys.path so we can import app and models
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app  # type: ignore
from models import User, Resume, Analysis, Report, db  # type: ignore
from config import get_config  # type: ignore
# pyrefly: ignore [missing-import]

def prompt_credentials():
    """Prompt user for MySQL credentials or read from command line arguments"""
    import argparse
    parser = argparse.ArgumentParser(description="Migrate SQLite to MySQL")
    parser.add_argument("--host", default=None, help="MySQL Host")
    parser.add_argument("--port", default=None, help="MySQL Port")
    parser.add_argument("--user", default=None, help="MySQL Username")
    parser.add_argument("--password", default=None, help="MySQL Password")
    parser.add_argument("--database", default=None, help="MySQL Database Name")
    
    # We might be called from another script or CLI without args
    args, unknown = parser.parse_known_args()
    
    # Check env var for password as well
    env_password = os.getenv("MYSQL_PASSWORD", None)
    
    host = args.host or os.getenv("MYSQL_HOST")
    port = args.port or os.getenv("MYSQL_PORT")
    user = args.user or os.getenv("MYSQL_USER")
    password = args.password or env_password
    db_name = args.database or os.getenv("MYSQL_DATABASE")
    
    # If any credential is not provided, prompt the user
    if host is None:
        host = input("MySQL Host [localhost]: ").strip() or "localhost"
    if port is None:
        port = input("MySQL Port [3306]: ").strip() or "3306"
    if user is None:
        user = input("MySQL Username [root]: ").strip() or "root"
    if password is None:
        import getpass
        try:
            password = getpass.getpass("MySQL Password: ")
        except Exception:
            password = input("MySQL Password: ")
    if db_name is None:
        db_name = input("MySQL Database Name [resumewise]: ").strip() or "resumewise"
    
    return host, port, user, password, db_name

def test_mysql_connection(host, port, user, password):
    """Test connection to MySQL server and return engine"""
    import sqlalchemy as sa  # type: ignore
    import urllib.parse
    encoded_password = urllib.parse.quote_plus(password)
    # Try connecting without database first to see if credentials work
    conn_url = f"mysql+pymysql://{user}:{encoded_password}@{host}:{port}"
    try:
        engine = sa.create_engine(conn_url)
        with engine.connect() as conn:
            conn.execute(sa.text("SELECT 1"))
        return engine
    except Exception as e:
        print(f"[ERROR] Failed to connect to MySQL server: {e}")
        return None

def create_mysql_database(engine, db_name):
    """Create the target MySQL database if it doesn't exist"""
    import sqlalchemy as sa  # type: ignore
    try:
        with engine.connect() as conn:
            # MySQL database names are identifier, so use text.execution_options(autocommit=True)
            # and format safely since DB name is sanitised
            conn.execute(sa.text(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
            print(f"[OK] Database '{db_name}' verified/created.")
            return True
    except Exception as e:
        print(f"[ERROR] Failed to create database '{db_name}': {e}")
        return False

def update_dotenv(host, port, user, password, db_name):
    """Update backend/.env with the new MySQL DATABASE_URL"""
    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        print(f"[WARNING] .env file not found at {env_path}")
        return False
        
    lines = env_path.read_text().splitlines()
    new_lines = []
    updated = False
    import urllib.parse
    encoded_password = urllib.parse.quote_plus(password)
    mysql_url = f"DATABASE_URL=mysql+pymysql://{user}:{encoded_password}@{host}:{port}/{db_name}"
    
    for line in lines:
        if line.startswith("DATABASE_URL="):
            new_lines.append(mysql_url)
            updated = True
        else:
            new_lines.append(line)
            
    if not updated:
        new_lines.append(mysql_url)
        
    env_path.write_text("\n".join(new_lines) + "\n")
    print(f"[OK] Updated {env_path} with new DATABASE_URL.")
    return True

def migrate_data(sqlite_db_path, mysql_url):
    """Run data migration from SQLite to MySQL using SQLAlchemy sessions"""
    import sqlalchemy as sa  # type: ignore
    from sqlalchemy.orm import sessionmaker  # type: ignore
    
    # Create a Flask app configured with MySQL database URL
    mysql_app = create_app()
    mysql_app.config['SQLALCHEMY_DATABASE_URI'] = mysql_url
    mysql_app.config['SQLALCHEMY_ECHO'] = False
    
    # Establish SQLite connection
    sqlite_engine = sa.create_engine(f"sqlite:///{sqlite_db_path}")
    SqliteSession = sessionmaker(bind=sqlite_engine)
    sqlite_session = SqliteSession()
    
    print("\n--- Starting Data Migration ---")
    
    with mysql_app.app_context():
        # Recreate MySQL schemas to make sure they are fresh and clean
        print("Dropping existing tables in MySQL (if any)...")
        db.drop_all()
        print("Creating table structures in MySQL...")
        db.create_all()
        
        # 1. Migrate Users
        print("\nMigrating Users...")
        sqlite_users = sqlite_session.execute(sa.select(User)).scalars().all()
        print(f"Found {len(sqlite_users)} users in SQLite.")
        for u in sqlite_users:
            # Create fresh User model to detach from sqlite session
            new_user = User(
                id=u.id,
                name=u.name,
                email=u.email,
                password_hash=u.password_hash,
                phone=u.phone,
                profile_picture=u.profile_picture,
                bio=u.bio,
                target_role=u.target_role,
                is_active=u.is_active,
                created_at=u.created_at,
                updated_at=u.updated_at
            )
            db.session.add(new_user)
        db.session.commit()
        print(f"[OK] Migrated {len(sqlite_users)} users.")
        
        # 2. Migrate Resumes
        print("\nMigrating Resumes...")
        sqlite_resumes = sqlite_session.execute(sa.select(Resume)).scalars().all()
        print(f"Found {len(sqlite_resumes)} resumes in SQLite.")
        for r in sqlite_resumes:
            new_resume = Resume(
                id=r.id,
                user_id=r.user_id,
                file_name=r.file_name,
                file_path=r.file_path,
                original_name=r.original_name,
                file_type=r.file_type,
                file_size=r.file_size,
                ats_score=r.ats_score,
                target_role=r.target_role,
                extracted_text=r.extracted_text,
                extracted_skills=r.extracted_skills,
                extracted_projects=r.extracted_projects,
                extracted_certifications=r.extracted_certifications,
                extracted_education=r.extracted_education,
                extracted_experience=r.extracted_experience,
                analysis_status=r.analysis_status,
                is_analyzed=r.is_analyzed,
                uploaded_at=r.uploaded_at,
                analyzed_at=r.analyzed_at,
                updated_at=r.updated_at
            )
            db.session.add(new_resume)
        db.session.commit()
        print(f"[OK] Migrated {len(sqlite_resumes)} resumes.")
        
        # 3. Migrate Analyses
        print("\nMigrating Analyses...")
        sqlite_analyses = sqlite_session.execute(sa.select(Analysis)).scalars().all()
        print(f"Found {len(sqlite_analyses)} analyses in SQLite.")
        for a in sqlite_analyses:
            new_analysis = Analysis(
                id=a.id,
                resume_id=a.resume_id,
                skills_match_score=a.skills_match_score,
                projects_score=a.projects_score,
                certifications_score=a.certifications_score,
                keywords_score=a.keywords_score,
                formatting_score=a.formatting_score,
                total_ats_score=a.total_ats_score,
                matching_skills=a.matching_skills,
                missing_skills=a.missing_skills,
                recommended_skills=a.recommended_skills,
                missing_required_skills=a.missing_required_skills,
                missing_preferred_skills=a.missing_preferred_skills,
                summary=a.summary,
                strengths=a.strengths,
                weaknesses=a.weaknesses,
                improvement_suggestions=a.improvement_suggestions,
                career_guidance=a.career_guidance,
                job_trends=a.job_trends,
                salary_data=a.salary_data,
                required_skills=a.required_skills,
                created_at=a.created_at,
                updated_at=a.updated_at
            )
            db.session.add(new_analysis)
        db.session.commit()
        print(f"[OK] Migrated {len(sqlite_analyses)} analyses.")
        
        # 4. Migrate Reports
        print("\nMigrating Reports...")
        sqlite_reports = sqlite_session.execute(sa.select(Report)).scalars().all()
        print(f"Found {len(sqlite_reports)} reports in SQLite.")
        for rep in sqlite_reports:
            new_report = Report(
                id=rep.id,
                user_id=rep.user_id,
                resume_id=rep.resume_id,
                report_title=rep.report_title,
                report_data=rep.report_data,
                ats_score_data=rep.ats_score_data,
                skills_analysis_data=rep.skills_analysis_data,
                ai_feedback_data=rep.ai_feedback_data,
                interview_questions_data=rep.interview_questions_data,
                career_roadmap_data=rep.career_roadmap_data,
                course_recommendations_data=rep.course_recommendations_data,
                pdf_file_path=rep.pdf_file_path,
                file_size=rep.file_size,
                status=rep.status,
                is_downloaded=rep.is_downloaded,
                download_count=rep.download_count,
                created_at=rep.created_at,
                updated_at=rep.updated_at
            )
            db.session.add(new_report)
        db.session.commit()
        print(f"[OK] Migrated {len(sqlite_reports)} reports.")

    sqlite_session.close()
    print("\n[OK] Data migration finished successfully!")

def main():
    # SQLite file path checking
    sqlite_db_path = Path(__file__).parent / "instance" / "resumewise.db"
    if not sqlite_db_path.exists():
        # Try parent folder just in case
        sqlite_db_path = Path(__file__).parent / "resumewise.db"
        if not sqlite_db_path.exists():
            print("[ERROR] SQLite database file not found. Checked: instance/resumewise.db and resumewise.db")
            sys.exit(1)
            
    print(f"Found SQLite Database at: {sqlite_db_path}")
    
    # Prompt user for credentials
    host, port, user, password, db_name = prompt_credentials()
    
    # Connect to MySQL and test credentials
    engine = test_mysql_connection(host, port, user, password)
    if not engine:
        sys.exit(1)
        
    # Create MySQL database
    if not create_mysql_database(engine, db_name):
        sys.exit(1)
        
    import urllib.parse
    encoded_password = urllib.parse.quote_plus(password)
    mysql_url = f"mysql+pymysql://{user}:{encoded_password}@{host}:{port}/{db_name}"
    try:
        migrate_data(sqlite_db_path, mysql_url)
    except Exception as e:
        print(f"[ERROR] Error during migration process: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
        
    # Update environment variables
    update_dotenv(host, port, user, password, db_name)
    print("\n[SUCCESS] Migration Completed Successfully!")

if __name__ == "__main__":
    main()
