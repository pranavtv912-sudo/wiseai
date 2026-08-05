"""
OTP Model
Represents one-time passwords for email verification, password reset, and password changes.
"""

from models.User import db
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

class Otp(db.Model):
    """OTP model for verification and security rate-limiting"""
    
    __tablename__ = 'otps'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), nullable=False, index=True)
    otp_hash = db.Column(db.String(255), nullable=False)
    purpose = db.Column(db.String(50), nullable=False) # 'register', 'forgot_password', 'change_password'
    attempts = db.Column(db.Integer, default=0)
    signup_data = db.Column(db.Text, nullable=True) # JSON representation of user signup data
    is_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)

    def set_otp(self, otp_code):
        """Hash and set the OTP code"""
        self.otp_hash = generate_password_hash(otp_code)

    def check_otp(self, otp_code):
        """Verify OTP code against hash"""
        return check_password_hash(self.otp_hash, otp_code)
