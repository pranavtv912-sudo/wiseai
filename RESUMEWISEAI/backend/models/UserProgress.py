from datetime import datetime
from models.User import db
import uuid


class UserProgress(db.Model):
    """User progress tracker model"""

    __tablename__ = 'user_progress'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    skill_name = db.Column(db.String(255), nullable=False)
    progress_percentage = db.Column(db.Float, nullable=False, default=0.0)
    completed = db.Column(db.Boolean, nullable=False, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref='progress_entries', lazy=True)

    def __repr__(self):
        return f'<UserProgress {self.user_id} {self.skill_name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'skill_name': self.skill_name,
            'progress_percentage': self.progress_percentage,
            'completed': self.completed,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
