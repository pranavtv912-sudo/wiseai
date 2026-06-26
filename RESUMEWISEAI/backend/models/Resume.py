"""
Resume Model
Represents user resume uploads and analysis metadata
"""

from datetime import datetime
from models.User import db
import uuid


class Resume(db.Model):
    """Resume model for uploaded resume files and metadata"""
    
    __tablename__ = 'resumes'
    
    # Columns
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False, index=True)
    file_name = db.Column(db.String(500), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(10), nullable=False)  # pdf, docx, etc.
    file_size = db.Column(db.Integer, nullable=False)  # in bytes
    
    # Analysis Data
    ats_score = db.Column(db.Float, default=0.0)
    target_role = db.Column(db.String(255), nullable=True)
    extracted_text = db.Column(db.Text, nullable=True)
    extracted_skills = db.Column(db.JSON, nullable=True, default=[])
    extracted_projects = db.Column(db.JSON, nullable=True, default=[])
    extracted_certifications = db.Column(db.JSON, nullable=True, default=[])
    extracted_education = db.Column(db.JSON, nullable=True, default=[])
    extracted_experience = db.Column(db.JSON, nullable=True, default=[])
    
    # Status
    analysis_status = db.Column(db.String(50), default='pending')  # pending, completed, failed
    is_analyzed = db.Column(db.Boolean, default=False)
    
    # Timestamps
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    analyzed_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    analysis = db.relationship('Analysis', backref='resume', uselist=False, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Resume {self.original_name}>'
    
    def to_dict(self):
        """Convert resume object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'file_name': self.original_name,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'ats_score': self.ats_score,
            'target_role': self.target_role,
            'is_analyzed': self.is_analyzed,
            'analysis_status': self.analysis_status,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'analyzed_at': self.analyzed_at.isoformat() if self.analyzed_at else None,
        }


class Analysis(db.Model):
    """Analysis results for resume"""
    
    __tablename__ = 'analyses'
    
    # Columns
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = db.Column(db.String(36), db.ForeignKey('resumes.id'), nullable=False, unique=True)
    
    # ATS Score Breakdown
    skills_match_score = db.Column(db.Float, default=0.0)
    projects_score = db.Column(db.Float, default=0.0)
    certifications_score = db.Column(db.Float, default=0.0)
    keywords_score = db.Column(db.Float, default=0.0)
    formatting_score = db.Column(db.Float, default=0.0)
    total_ats_score = db.Column(db.Float, default=0.0)
    
    # Skill Analysis
    matching_skills = db.Column(db.JSON, nullable=True, default=[])
    missing_skills = db.Column(db.JSON, nullable=True, default=[])
    recommended_skills = db.Column(db.JSON, nullable=True, default=[])
    missing_required_skills = db.Column(db.JSON, nullable=True, default=[])
    missing_preferred_skills = db.Column(db.JSON, nullable=True, default=[])
    
    # AI Analysis
    summary = db.Column(db.Text, nullable=True)
    strengths = db.Column(db.JSON, nullable=True, default=[])
    weaknesses = db.Column(db.JSON, nullable=True, default=[])
    improvement_suggestions = db.Column(db.JSON, nullable=True, default=[])
    career_guidance = db.Column(db.Text, nullable=True)
    
    # Market Data
    job_trends = db.Column(db.JSON, nullable=True)
    salary_data = db.Column(db.JSON, nullable=True)
    required_skills = db.Column(db.JSON, nullable=True, default=[])
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Analysis {self.resume_id}>'
    
    def to_dict(self):
        """Convert analysis object to dictionary"""
        return {
            'id': self.id,
            'resume_id': self.resume_id,
            'ats_score': {
                'total': self.total_ats_score,
                'skills_match': self.skills_match_score,
                'projects': self.projects_score,
                'certifications': self.certifications_score,
                'keywords': self.keywords_score,
                'formatting': self.formatting_score,
            },
            'skills': {
                'matching': self.matching_skills,
                'missing': self.missing_skills,
                'recommended': self.recommended_skills,
                'missing_required': self.missing_required_skills,
                'missing_preferred': self.missing_preferred_skills,
            },
            'ai_analysis': {
                'summary': self.summary,
                'strengths': self.strengths,
                'weaknesses': self.weaknesses,
                'improvement_suggestions': self.improvement_suggestions,
                'career_guidance': self.career_guidance,
            },
            'market_data': {
                'job_trends': self.job_trends,
                'salary_data': self.salary_data,
                'required_skills': self.required_skills,
            },
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def to_detailed_dict(self):
        """Convert analysis object to detailed flat dictionary"""
        return {
            'id': self.id,
            'resume_id': self.resume_id,
            'total_ats_score': self.total_ats_score,
            'skills_match_score': self.skills_match_score,
            'projects_score': self.projects_score,
            'certifications_score': self.certifications_score,
            'keywords_score': self.keywords_score,
            'formatting_score': self.formatting_score,
            'score_breakdown': {
                'skills_match': self.skills_match_score,
                'projects': self.projects_score,
                'certifications': self.certifications_score,
                'keywords': self.keywords_score,
                'formatting': self.formatting_score,
            },
            'weighted_scores': {
                'skills_match': round(self.skills_match_score * 0.40, 2),
                'projects': round(self.projects_score * 0.20, 2),
                'certifications': round(self.certifications_score * 0.15, 2),
                'keywords': round(self.keywords_score * 0.15, 2),
                'formatting': round(self.formatting_score * 0.10, 2),
            },
            'matching_skills': self.matching_skills,
            'missing_skills': self.missing_skills,
            'recommended_skills': self.recommended_skills,
            'missing_required_skills': self.missing_required_skills,
            'missing_preferred_skills': self.missing_preferred_skills,
            'summary': self.summary,
            'strengths': self.strengths,
            'weaknesses': self.weaknesses,
            'improvement_suggestions': self.improvement_suggestions,
            'career_guidance': self.career_guidance,
            'job_trends': self.job_trends,
            'salary_data': self.salary_data,
            'required_skills': self.required_skills,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
