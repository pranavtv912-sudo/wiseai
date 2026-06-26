from datetime import datetime
from models.User import db
import uuid


class LearningHistory(db.Model):
    """Learning history model for watched video sessions"""

    __tablename__ = 'learning_history'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    video_id = db.Column(db.String(50), nullable=False)
    video_title = db.Column(db.String(500), nullable=False)
    skill_name = db.Column(db.String(255), nullable=False)
    watched_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='watch_history', lazy=True)

    def __repr__(self):
        return f'<LearningHistory {self.user_id} {self.video_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'video_id': self.video_id,
            'video_title': self.video_title,
            'skill_name': self.skill_name,
            'watched_at': self.watched_at.isoformat() if self.watched_at else None,
        }
