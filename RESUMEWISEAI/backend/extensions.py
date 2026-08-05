"""
Extensions Module
Centralizes Flask extensions initialization (e.g. SQLAlchemy db instance)
to prevent circular dependency issues and multiple DB instances.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
