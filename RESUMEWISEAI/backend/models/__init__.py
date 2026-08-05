"""
Models package initialization
Exports all database models and the shared extensions db instance
"""

from extensions import db
from models.User import User
from models.Resume import Resume, Analysis
from models.Report import Report
from models.UserProgress import UserProgress
from models.LearningHistory import LearningHistory
from models.JobRole import JobRole
from models.Otp import Otp

__all__ = [
    'User',
    'Resume',
    'Analysis',
    'Report',
    'UserProgress',
    'LearningHistory',
    'JobRole',
    'Otp',
    'db'
]
