"""
Report Model
Represents generated reports containing analysis results and recommendations
"""

from datetime import datetime
import uuid
from extensions import db


class Report(db.Model):
    """Report model for generated PDF reports"""
    
    __tablename__ = 'reports'
    
    # Columns
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    resume_id = db.Column(db.String(36), nullable=True)
    
    # Report Content
    report_title = db.Column(db.String(255), nullable=False)
    report_data = db.Column(db.Text, nullable=False)  # JSON stringified data
    
    # Report Components
    ats_score_data = db.Column(db.JSON, nullable=True)
    skills_analysis_data = db.Column(db.JSON, nullable=True)
    ai_feedback_data = db.Column(db.JSON, nullable=True)
    interview_questions_data = db.Column(db.JSON, nullable=True)
    career_roadmap_data = db.Column(db.JSON, nullable=True)
    course_recommendations_data = db.Column(db.JSON, nullable=True)
    
    # File Information
    pdf_file_path = db.Column(db.String(500), nullable=True)
    file_size = db.Column(db.Integer, nullable=True)
    
    # Status and Metadata
    status = db.Column(db.String(50), default='generated')  # generated, exported, downloaded
    is_downloaded = db.Column(db.Boolean, default=False)
    download_count = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Report {self.report_title}>'
    
    def to_dict(self):
        """Convert report object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'resume_id': self.resume_id,
            'report_title': self.report_title,
            'status': self.status,
            'is_downloaded': self.is_downloaded,
            'download_count': self.download_count,
            'pdf_file_path': self.pdf_file_path,
            'file_size': self.file_size,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
    
    def to_detailed_dict(self):
        """Convert report object to detailed dictionary with all data"""
        import json
        result = self.to_dict()
        try:
            result['report_data'] = json.loads(self.report_data) if isinstance(self.report_data, str) else self.report_data
            result['ats_score_data'] = self.ats_score_data
            result['skills_analysis_data'] = self.skills_analysis_data
            result['ai_feedback_data'] = self.ai_feedback_data
            result['interview_questions_data'] = self.interview_questions_data
            result['career_roadmap_data'] = self.career_roadmap_data
            result['course_recommendations_data'] = self.course_recommendations_data
        except:
            pass
        return result
