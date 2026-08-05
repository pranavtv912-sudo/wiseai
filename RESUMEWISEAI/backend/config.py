"""
Configuration file for ResumeWise AI Backend
Handles environment-based configurations for development, testing, and production
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Base configuration"""

    # =====================================================
    # Flask Configuration
    # =====================================================

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "change-this-secret-key"
    )

    DEBUG = False
    TESTING = False

    # =====================================================
    # Database Configuration (Railway + MySQL + PyMySQL)
    # =====================================================

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "sqlite:///resumewise.db"
    )

    # Railway usually provides mysql://
    if DATABASE_URL.startswith("mysql://"):
        DATABASE_URL = DATABASE_URL.replace(
            "mysql://",
            "mysql+pymysql://",
            1
        )

    # Fix if mysqldb is used
    if DATABASE_URL.startswith("mysql+mysqldb://"):
        DATABASE_URL = DATABASE_URL.replace(
            "mysql+mysqldb://",
            "mysql+pymysql://",
            1
        )

    SQLALCHEMY_DATABASE_URI = DATABASE_URL

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20,
    }

    # =====================================================
    # JWT
    # =====================================================

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "jwt-secret-key"
    )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=90)

    # =====================================================
    # Uploads
    # =====================================================

    UPLOAD_FOLDER = os.path.join(
        os.path.dirname(__file__),
        "uploads"
    )

    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

    ALLOWED_EXTENSIONS = {
        "pdf",
        "doc",
        "docx",
    }

    # =====================================================
    # AI APIs
    # =====================================================

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    OPENROUTER_API_KEY = os.getenv(
        "OPENROUTER_API_KEY",
        ""
    )

    OPENROUTER_MODEL = os.getenv(
        "OPENROUTER_MODEL",
        "google/gemini-2.5-flash"
    )

    # =====================================================
    # External APIs
    # =====================================================

    YOUTUBE_API_KEY = os.getenv(
        "YOUTUBE_API_KEY",
        ""
    )

    ADZUNA_API_ID = os.getenv(
        "ADZUNA_API_ID",
        ""
    )

    ADZUNA_API_KEY = os.getenv(
        "ADZUNA_API_KEY",
        ""
    )

    # =====================================================
    # SMTP
    # =====================================================

    SMTP_HOST = os.getenv(
        "SMTP_HOST",
        "smtp.gmail.com"
    )

    SMTP_PORT = int(
        os.getenv("SMTP_PORT", "587")
    )

    SMTP_USER = os.getenv(
        "SMTP_USER",
        ""
    )

    SMTP_PASSWORD = os.getenv(
        "SMTP_PASSWORD",
        ""
    )

    # =====================================================
    # CORS
    # =====================================================

    CORS_ORIGINS = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000"
    ).split(",")

    # =====================================================
    # SpaCy
    # =====================================================

    SPACY_MODEL = "en_core_web_sm"

    # =====================================================
    # Pagination
    # =====================================================

    ITEMS_PER_PAGE = 20


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True


class TestingConfig(Config):
    TESTING = True

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "TEST_DATABASE_URL",
        "sqlite:///resumewise_test.db"
    )

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)


class ProductionConfig(Config):
    DEBUG = False


config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config():
    env = os.getenv(
        "FLASK_ENV",
        "development"
    )
    return config.get(env, config["default"])