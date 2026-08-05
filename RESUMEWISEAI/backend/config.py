"""
Configuration file for ResumeWise AI Backend
Handles environment-based configurations for local development and Railway production environments.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv
import pymysql

# Install PyMySQL as MySQLdb driver replacement for legacy compatibility
pymysql.install_as_MySQLdb()

# Load environment variables from .env file
load_dotenv()


def format_db_uri(uri: str) -> str:
    """
    Ensures that MySQL database URIs use the PyMySQL driver (mysql+pymysql://).
    Converts legacy 'mysql://' or 'mysql+mysqldb://' prefixes.
    """
    if not uri:
        return uri
    if uri.startswith("mysql://"):
        return uri.replace("mysql://", "mysql+pymysql://", 1)
    if uri.startswith("mysql+mysqldb://"):
        return uri.replace("mysql+mysqldb://", "mysql+pymysql://", 1)
    return uri


def get_database_uri() -> str:
    """
    Dynamically resolves the SQLALCHEMY_DATABASE_URI based on environment:

    1. Railway Production Environment:
       - Automatically detected via Railway environment variables.
       - Uses Railway's provided DATABASE_URL (or MYSQL_URL / MYSQLPRIVATE_URL / MYSQLURL).
       - Automatically converts mysql:// to mysql+pymysql://.

    2. Local Development Environment (Windows / Local machine):
       - Uses LOCAL_DATABASE_URL if explicitly set in .env.
       - Otherwise uses DATABASE_URL if set AND NOT pointing to internal Railway hostnames.
       - Otherwise defaults to local MySQL (mysql+pymysql://root:root@localhost:3306/resumewise).
       - Never uses 'mysql.railway.internal' locally.
    """
    # Detect if running inside Railway deployment container
    is_railway = any(
        os.getenv(k)
        for k in (
            "RAILWAY_ENVIRONMENT",
            "RAILWAY_PROJECT_ID",
            "RAILWAY_SERVICE_ID",
            "RAILWAY_STATIC_URL",
            "RAILWAY_DEPLOYMENT_ID",
            "RAILWAY_GIT_COMMIT_SHA",
        )
    )

    if is_railway:
        # Production on Railway
        db_url = (
            os.getenv("DATABASE_URL")
            or os.getenv("MYSQL_URL")
            or os.getenv("MYSQLPRIVATE_URL")
            or os.getenv("MYSQLURL")
        )
        if db_url:
            return format_db_uri(db_url)

        # Fallback to constructing from Railway MySQL variables if defined individually
        user = os.getenv("MYSQLUSER", "root")
        password = os.getenv("MYSQLPASSWORD", "")
        host = os.getenv("MYSQLHOST", "mysql.railway.internal")
        port = os.getenv("MYSQLPORT", "3306")
        dbname = os.getenv("MYSQLDATABASE", "railway")

        auth = f"{user}:{password}" if password else user
        return f"mysql+pymysql://{auth}@{host}:{port}/{dbname}"

    # Local Development Mode
    # 1. Check if LOCAL_DATABASE_URL is provided in environment
    local_db_url = os.getenv("LOCAL_DATABASE_URL")
    if local_db_url:
        return format_db_uri(local_db_url)

    # 2. Check if DATABASE_URL is set and NOT pointing to railway.internal
    env_db_url = os.getenv("DATABASE_URL", "")
    if env_db_url and "railway.internal" not in env_db_url:
        return format_db_uri(env_db_url)

    # 3. Default to localhost MySQL
    user = os.getenv("LOCAL_MYSQL_USER", os.getenv("MYSQL_USER", "root"))
    password = os.getenv("LOCAL_MYSQL_PASSWORD", os.getenv("MYSQL_PASSWORD", "root"))
    host = os.getenv("LOCAL_MYSQL_HOST", os.getenv("MYSQL_HOST", "localhost"))
    port = os.getenv("LOCAL_MYSQL_PORT", os.getenv("MYSQL_PORT", "3306"))
    dbname = os.getenv("LOCAL_MYSQL_DB", os.getenv("MYSQL_DB", "resumewise"))

    auth = f"{user}:{password}" if password else user
    return f"mysql+pymysql://{auth}@{host}:{port}/{dbname}"


class Config:
    """Base configuration"""

    # Flask Configuration
    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-key-in-production")
    DEBUG = False
    TESTING = False

    # Database Configuration (PyMySQL engine)
    SQLALCHEMY_DATABASE_URI = get_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20,
    }

    # JWT Configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=90)

    # File Upload Configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {"pdf", "doc", "docx"}

    # External API Keys & Configuration
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash")
    YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
    ADZUNA_API_ID = os.getenv("ADZUNA_API_ID", "")
    ADZUNA_API_KEY = os.getenv("ADZUNA_API_KEY", "")

    # SMTP Configuration for Email/OTP Services
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

    # CORS Configuration
    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
    ).split(",")

    # SpaCy Model
    SPACY_MODEL = "en_core_web_sm"

    # Pagination
    ITEMS_PER_PAGE = 20


class DevelopmentConfig(Config):
    """Development environment configuration"""
    DEBUG = True
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    """Testing environment configuration"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = format_db_uri(
        os.getenv("TEST_DATABASE_URL", "sqlite:///resumewise_test.db")
    )
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)


class ProductionConfig(Config):
    """Production environment configuration"""
    DEBUG = False


config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config():
    """Returns application configuration based on FLASK_ENV environment variable."""
    env = os.getenv("FLASK_ENV", "development")
    return config.get(env, config["default"])