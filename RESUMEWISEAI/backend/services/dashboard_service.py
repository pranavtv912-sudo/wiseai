import datetime
import hashlib
from sqlalchemy import func, extract
from models.User import User
from models.Resume import Resume, Analysis
from models.UserProgress import UserProgress
from models import db

class DashboardService:
    def get_overview_stats(self, user_id):
        # ATS Score & Match
        analyses = db.session.query(Analysis).join(Resume).filter(Resume.user_id == user_id).all()
        
        ats_score = 0
        resume_match = 0
        analysis_count = len(analyses)
        if analysis_count > 0:
            # Average total ATS score
            ats_score = int(sum(a.total_ats_score or 0 for a in analyses) / analysis_count)
            # Average skills match
            resume_match = int(sum(a.skills_match_score or 0 for a in analyses) / analysis_count)
            
        # Resume uploads
        resume_uploads = Resume.query.filter_by(user_id=user_id).count()
        
        # Skills Completed vs Missing
        progress_all = UserProgress.query.filter_by(user_id=user_id).all()
        skills_completed = sum(1 for p in progress_all if p.completed)
        missing_skills = sum(1 for p in progress_all if not p.completed)
        
        # Roadmap progress %
        total_skills = len(progress_all)
        roadmap_progress = int((skills_completed / total_skills) * 100) if total_skills > 0 else 0
        
        # Interview Score (Deterministic Mock based on user_id since no table exists)
        seed_hash = int(hashlib.md5(user_id.encode('utf-8')).hexdigest(), 16)
        interview_score = 65 + (seed_hash % 30) # Between 65 and 95
        
        return {
            "ats_score": ats_score,
            "resume_match": resume_match,
            "roadmap_progress": roadmap_progress,
            "interview_score": interview_score,
            "resume_uploads": resume_uploads,
            "analysis_count": analysis_count,
            "skills_completed": skills_completed,
            "missing_skills": missing_skills
        }
        
    def get_charts_data(self, user_id):
        # ATS History (Aggregate max score by month)
        # Note: Since SQLite doesn't easily extract month names natively, we'll map integers.
        months_map = {1:"Jan", 2:"Feb", 3:"Mar", 4:"Apr", 5:"May", 6:"Jun", 7:"Jul", 8:"Aug", 9:"Sep", 10:"Oct", 11:"Nov", 12:"Dec"}
        
        analyses = db.session.query(Analysis, Resume).join(Resume).filter(Resume.user_id == user_id).all()
        
        monthly_scores = {}
        for analysis, resume in analyses:
            if resume.uploaded_at:
                month_num = resume.uploaded_at.month
                score = analysis.total_ats_score or 0
                if month_num not in monthly_scores or score > monthly_scores[month_num]:
                    monthly_scores[month_num] = score
                    
        # Sort and take last 4 months, or mock if none
        sorted_months = sorted(monthly_scores.items())
        ats_history = [{"month": months_map.get(m, "Unknown"), "score": s} for m, s in sorted_months][-6:]
        
        if not ats_history:
            # Fallback if no history exists yet
            ats_history = [
                {"month": "Jan", "score": 60},
                {"month": "Feb", "score": 75},
                {"month": "Mar", "score": 82},
                {"month": "Apr", "score": 88}
            ]

        # Roadmap
        progress_all = UserProgress.query.filter_by(user_id=user_id).all()
        completed = sum(1 for p in progress_all if p.completed)
        remaining = sum(1 for p in progress_all if not p.completed)
        roadmap = [{"completed": completed, "remaining": remaining}]

        # Resume Uploads grouped by day of week
        day_map = {0:"Mon", 1:"Tue", 2:"Wed", 3:"Thu", 4:"Fri", 5:"Sat", 6:"Sun"}
        day_counts = {day: 0 for day in day_map.values()}
        
        resumes = Resume.query.filter_by(user_id=user_id).all()
        for r in resumes:
            if r.uploaded_at:
                day_name = day_map[r.uploaded_at.weekday()]
                day_counts[day_name] += 1
                
        resumeUploads = [{"day": day, "count": count} for day, count in day_counts.items() if count > 0]
        if not resumeUploads:
            resumeUploads = [
                {"day": "Mon", "count": 1},
                {"day": "Tue", "count": 2},
                {"day": "Wed", "count": 1},
                {"day": "Thu", "count": 3}
            ]

        # Interview (Deterministic Mock)
        seed_hash = int(hashlib.md5(user_id.encode('utf-8')).hexdigest(), 16)
        base = 60 + (seed_hash % 20)
        interview = [
            {"round": "1", "score": base},
            {"round": "2", "score": min(100, base + 12)},
            {"round": "3", "score": min(100, base + 21)}
        ]

        return {
            "ats_history": ats_history,
            "roadmap": roadmap,
            "resumeUploads": resumeUploads,
            "interview": interview
        }
