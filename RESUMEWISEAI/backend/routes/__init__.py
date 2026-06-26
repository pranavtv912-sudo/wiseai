"""
Routes package initialization
Exports all route blueprints
"""

from routes.auth_routes import auth_routes
from routes.resume_routes import resume_routes
from routes.analysis_routes import analysis_routes
from routes.roadmap_routes import roadmap_routes
from routes.interview_routes import interview_routes
from routes.report_routes import report_routes
from routes.progress_routes import progress_routes
from routes.history_routes import history_routes
from routes.roles_routes import roles_routes
from routes.jd_match_routes import jd_match_routes
from routes.chat_routes import chat_routes
from routes.resume_builder_routes import resume_builder_routes
from routes.dashboard_routes import dashboard_routes

__all__ = [
    'auth_routes',
    'resume_routes',
    'analysis_routes',
    'roadmap_routes',
    'interview_routes',
    'report_routes',
    'progress_routes',
    'history_routes',
    'roles_routes',
    'jd_match_routes',
    'chat_routes',
    'resume_builder_routes',
    'dashboard_routes'
]
