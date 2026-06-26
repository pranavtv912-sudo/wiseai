"""
User Model
Represents user account information and authentication details
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication and profile management"""
    
    __tablename__ = 'users'
    
    # Columns
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    profile_picture = db.Column(db.String(500), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    target_role = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    resumes = db.relationship('Resume', backref='user', cascade='all, delete-orphan', lazy=True)
    reports = db.relationship('Report', backref='user', cascade='all, delete-orphan', lazy=True)
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password):
        """Hash and set user password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'profile_picture': self.profile_picture,
            'bio': self.bio,
            'target_role': self.target_role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
