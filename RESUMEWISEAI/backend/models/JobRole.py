"""
JobRole Model
Stores all available target job roles for resume analysis
"""

from datetime import datetime
from extensions import db


class JobRole(db.Model):
    """Predefined job roles available for resume targeting"""

    __tablename__ = 'job_roles'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False, unique=True, index=True)
    category = db.Column(db.String(100), nullable=True, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, title=None, category=None, is_active=True, **kwargs):
        self.title = title
        self.category = category
        self.is_active = is_active
        for key, value in kwargs.items():
            setattr(self, key, value)

    def __repr__(self):
        return f'<JobRole {self.title}>'

    def to_dict(self):
        """Convert job role to dictionary"""
        return {
            'id': self.id,
            'title': self.title,
            'category': self.category,
            'is_active': self.is_active,
        }
