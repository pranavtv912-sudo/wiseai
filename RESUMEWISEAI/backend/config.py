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
    Strips accidental outer quotes or whitespace.
    Converts legacy 'mysql://' or 'mysql+mysqldb://' prefixes.
    """
    if not uri:
        return uri
    uri = uri.strip().strip("'\"")
    if uri.startswith("mysql://"):
        return uri.replace("mysql://", "mysql+pymysql://", 1)
    if uri.startswith("mysql+mysqldb://"):
        return uri.replace("mysql+mysqldb://", "mysql+pymysql://", 1)
    return uri


def mask_db_url(url: str) -> str:
    """Helper to mask password in database URI for safe startup logging."""
    if not url:
        return "<EMPTY>"
    if "@" in url:
        try:
            proto_user, host_db = url.split("@", 1)
            if ":" in proto_user:
                proto, user = proto_user.rsplit(":", 1)
                return f"{proto}:*****@{host_db}"
            return f"*****@{host_db}"
        except Exception:
            return url
    return url


def get_database_uri() -> str:
    """
    Dynamically resolves the SQLALCHEMY_DATABASE_URI based on environment:

    1. Railway Production Environment:
       - Automatically detected via Railway environment variables or valid production database URLs.
       - Uses Railway's provided DATABASE_URL (or MYSQL_URL / MYSQLPRIVATE_URL / MYSQLURL).
       - Automatically converts mysql:// to mysql+pymysql:// and strips unexpanded variable strings.

    2. Local Development Environment:
       - Uses LOCAL_DATABASE_URL if explicitly set in .env.
       - Otherwise uses DATABASE_URL if set AND NOT pointing to internal Railway hostnames.
       - Otherwise defaults to local MySQL (mysql+pymysql://root:root@localhost:3306/resumewise).
    """
    raw_db_url = os.getenv("DATABASE_URL", "").strip().strip("'\"")
    raw_mysql_url = os.getenv("MYSQL_URL", "").strip().strip("'\"")
    raw_mysql_private_url = os.getenv("MYSQLPRIVATE_URL", "").strip().strip("'\"")
    raw_mysqlhost = os.getenv("MYSQLHOST", "").strip().strip("'\"")

    # Helper to check if a URI string is valid (not empty and not unexpanded variable reference)
    def is_valid_url(url: str) -> bool:
        if not url:
            return False
        # Filter out literal unexpanded variable syntax like ${MySQL.DATABASE_URL}
        if "${" in url or "}" in url:
            return False
        return url.startswith("mysql://") or url.startswith("mysql+pymysql://") or url.startswith("mysql+mysqldb://") or url.startswith("postgres://") or url.startswith("postgresql://") or url.startswith("sqlite://")

    resolved_uri = None

    # Check for direct database URL candidates
    for candidate in [raw_db_url, raw_mysql_url, raw_mysql_private_url, os.getenv("MYSQLURL", "").strip().strip("'\"")]:
        if is_valid_url(candidate):
            resolved_uri = format_db_uri(candidate)
            break

    # If no direct valid URL but Railway MySQL environment variables exist
    if not resolved_uri and raw_mysqlhost:
        user = os.getenv("MYSQLUSER", "root").strip().strip("'\"")
        password = os.getenv("MYSQLPASSWORD", "").strip().strip("'\"")
        host = raw_mysqlhost
        port = os.getenv("MYSQLPORT", "3306").strip().strip("'\"")
        dbname = os.getenv("MYSQLDATABASE", "railway").strip().strip("'\"")
        auth = f"{user}:{password}" if password else user
        resolved_uri = f"mysql+pymysql://{auth}@{host}:{port}/{dbname}"

    # Check for local development explicit override
    local_db_url = os.getenv("LOCAL_DATABASE_URL", "").strip().strip("'\"")
    if is_valid_url(local_db_url):
        resolved_uri = format_db_uri(local_db_url)

    # Fallback to local default if no valid URI resolved so far or if pointing to railway.internal on local machine
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

    if not resolved_uri or (not is_railway and "railway.internal" in (resolved_uri or "")):
        user = os.getenv("LOCAL_MYSQL_USER", os.getenv("MYSQL_USER", "root")).strip().strip("'\"")
        password = os.getenv("LOCAL_MYSQL_PASSWORD", os.getenv("MYSQL_PASSWORD", "root")).strip().strip("'\"")
        host = os.getenv("LOCAL_MYSQL_HOST", os.getenv("MYSQL_HOST", "localhost")).strip().strip("'\"")
        port = os.getenv("LOCAL_MYSQL_PORT", os.getenv("MYSQL_PORT", "3306")).strip().strip("'\"")
        dbname = os.getenv("LOCAL_MYSQL_DB", os.getenv("MYSQL_DB", "resumewise")).strip().strip("'\"")

        auth = f"{user}:{password}" if password else user
        resolved_uri = f"mysql+pymysql://{auth}@{host}:{port}/{dbname}"

    # Startup Debug Logging
    print("=== Database Configuration Debug ===")
    print(f"  DATABASE_URL:          {mask_db_url(raw_db_url)}")
    print(f"  MYSQL_URL:             {mask_db_url(raw_mysql_url)}")
    print(f"  MYSQLHOST:             {raw_mysqlhost if raw_mysqlhost else '<EMPTY>'}")
    print(f"  Final SQLALCHEMY_URI:  {mask_db_url(resolved_uri)}")
    print("====================================")

    return resolved_uri


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