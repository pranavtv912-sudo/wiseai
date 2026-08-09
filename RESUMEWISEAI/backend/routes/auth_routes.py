"""
Authentication Routes
Handles user registration, login, and profile management with secure Email OTP Verification
"""

from flask import Blueprint, request, current_app
from models import User, db, Otp
from utils import generate_tokens, success_response, error_response, validate_email, validate_password, validate_name, token_required
from services.email_service import EmailService
from werkzeug.security import generate_password_hash
import secrets
from datetime import datetime, timedelta
import json

auth_routes = Blueprint('auth', __name__, url_prefix='/api/auth')


def generate_numeric_otp():
    """Generate a secure 6-digit numeric OTP"""
    return "".join(secrets.choice("0123456789") for _ in range(6))


@auth_routes.route('/register', methods=['POST'])
def register():
    """
    User registration endpoint (initiates OTP flow)
    
    Expected JSON:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "Password123!"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('Request body is required', status_code=400)
        
        # Validation
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        # Validate fields
        name_valid, name_error = validate_name(name)
        if not name_valid:
            return error_response(name_error, status_code=422)
        
        email_valid, email_error = validate_email(email)
        if not email_valid:
            return error_response(email_error, status_code=422)
        
        password_valid, password_error = validate_password(password)
        if not password_valid:
            return error_response(password_error, status_code=422)
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return error_response('Email already registered', status_code=409)
        
        # Invalidate previous OTPs for this email and purpose 'register'
        Otp.query.filter_by(email=email, purpose='register', is_used=False).update({'is_used': True})
        
        # Generate 6-digit OTP code
        otp_code = generate_numeric_otp()
        
        # Hash password securely before saving to MySQL / Otp table
        password_hash = generate_password_hash(password)
        signup_data = {
            'name': name,
            'email': email,
            'password_hash': password_hash
        }
        
        # Save OTP to database
        otp_entry = Otp(
            email=email,
            purpose='register',
            signup_data=json.dumps(signup_data),
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        otp_entry.set_otp(otp_code)
        
        db.session.add(otp_entry)
        db.session.commit()
        
        # Send OTP email
        email_sent = EmailService().send_otp_email(email, otp_code, 'register')
        if not email_sent:
            return error_response('Failed to send verification email', status_code=500)
            
        return success_response('Verification OTP sent successfully. Please check your email.', {
            'email': email,
            'redirect_to': 'verify-otp'
        }, status_code=200)
    
    except Exception as e:
        db.session.rollback()
        return error_response(f'Registration error: {str(e)}', status_code=500)


@auth_routes.route('/login', methods=['POST'])
def login():
    """
    User login endpoint
    
    Expected JSON:
    {
        "email": "john@example.com",
        "password": "Password123!"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('Request body is required', status_code=400)
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not email or not password:
            return error_response('Email and password are required', status_code=400)
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return error_response('Invalid email or password', status_code=401)
        
        if not user.is_active:
            return error_response('User account is inactive', status_code=403)
        
        # Generate tokens
        tokens = generate_tokens(user.id)
        
        return success_response('Login successful', {
            'user': user.to_dict(),
            'tokens': tokens
        })
    
    except Exception as e:
        return error_response(f'Login error: {str(e)}', status_code=500)


@auth_routes.route('/profile', methods=['GET'])
@token_required
def get_profile(user, payload):
    """
    Get authenticated user profile
    
    Headers:
    {
        "Authorization": "Bearer <access_token>"
    }
    """
    try:
        return success_response('Profile retrieved successfully', {
            'user': user.to_dict()
        })
    
    except Exception as e:
        return error_response(f'Error retrieving profile: {str(e)}', status_code=500)


@auth_routes.route('/profile', methods=['PUT'])
@token_required
def update_profile(user, payload):
    """
    Update user profile
    
    Expected JSON:
    {
        "name": "Jane Doe",
        "phone": "+1234567890",
        "bio": "Software Developer",
        "target_role": "Python Developer"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return error_response('Request body is required', status_code=400)
        
        # Update fields
        if 'name' in data:
            user.name = data['name'].strip()
        
        if 'phone' in data:
            user.phone = data['phone']
        
        if 'bio' in data:
            user.bio = data['bio']
        
        if 'target_role' in data:
            user.target_role = data['target_role']
        
        db.session.commit()
        
        return success_response('Profile updated successfully', {
            'user': user.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return error_response(f'Error updating profile: {str(e)}', status_code=500)


@auth_routes.route('/change-password', methods=['POST'])
@token_required
def change_password(user, payload):
    """
    Change user password
    
    Expected JSON:
    {
        "old_password": "OldPassword123!",
        "otp": "123456",
        "new_password": "NewPassword123!"
    }
    """
    try:
        data = request.get_json()
        
        old_password = data.get('old_password', '')
        otp_code = data.get('otp', '').strip()
        new_password = data.get('new_password', '')
        
        if not old_password or not otp_code or not new_password:
            return error_response('Old password, OTP code, and new password are required', status_code=400)
        
        # Verify old password
        if not user.check_password(old_password):
            return error_response('Old password is incorrect', status_code=401)
        
        # Validate new password
        valid, error = validate_password(new_password)
        if not valid:
            return error_response(error, status_code=422)
            
        # Verify OTP
        otp_entry = Otp.query.filter_by(
            email=user.email,
            purpose='change_password',
            is_used=False
        ).filter(Otp.expires_at > datetime.utcnow()).order_by(Otp.created_at.desc()).first()
        
        if not otp_entry:
            return error_response('Verification code is invalid or has expired', status_code=400)
            
        if otp_entry.attempts >= 5:
            return error_response('Maximum verification attempts exceeded. Please request a new OTP.', status_code=400)
            
        if not otp_entry.check_otp(otp_code):
            otp_entry.attempts += 1
            db.session.commit()
            return error_response(f'Invalid verification code. {5 - otp_entry.attempts} attempts remaining.', status_code=400)
        
        # Update password
        user.set_password(new_password)
        otp_entry.is_used = True
        db.session.commit()
        
        return success_response('Password changed successfully')
    
    except Exception as e:
        db.session.rollback()
        return error_response(f'Error changing password: {str(e)}', status_code=500)


@auth_routes.route('/verify-signup-otp', methods=['POST'])
def verify_signup_otp():
    """
    Verify registration OTP and create account
    
    Expected JSON:
    {
        "email": "john@example.com",
        "otp": "123456"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', status_code=400)
            
        email = data.get('email', '').strip()
        otp_code = data.get('otp', '').strip()
        
        if not email or not otp_code:
            return error_response('Email and OTP code are required', status_code=400)
            
        otp_entry = Otp.query.filter_by(
            email=email,
            purpose='register',
            is_used=False
        ).filter(Otp.expires_at > datetime.utcnow()).order_by(Otp.created_at.desc()).first()
        
        if not otp_entry:
            return error_response('Verification code is invalid or has expired', status_code=400)
            
        if otp_entry.attempts >= 5:
            return error_response('Maximum verification attempts exceeded. Please register again.', status_code=400)
            
        if not otp_entry.check_otp(otp_code):
            otp_entry.attempts += 1
            db.session.commit()
            return error_response(f'Invalid verification code. {5 - otp_entry.attempts} attempts remaining.', status_code=400)
            
        # Success: create user
        signup_data = json.loads(otp_entry.signup_data)
        
        # Ensure user doesn't already exist (race conditions)
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return error_response('Email already registered', status_code=409)
            
        user = User(
            name=signup_data['name'],
            email=signup_data['email'],
            password_hash=signup_data['password_hash']
        )
        
        otp_entry.is_used = True
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        tokens = generate_tokens(user.id)
        
        return success_response('User registered successfully', {
            'user': user.to_dict(),
            'tokens': tokens
        }, status_code=201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'OTP verification error: {str(e)}', status_code=500)


@auth_routes.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    Initiate password recovery by sending an OTP
    
    Expected JSON:
    {
        "email": "john@example.com"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', status_code=400)
            
        email = data.get('email', '').strip()
        if not email:
            return error_response('Email is required', status_code=400)
            
        # Check if user exists
        user = User.query.filter_by(email=email).first()
        if not user:
            return error_response('Email address not registered', status_code=404)
            
        # Invalidate old forgot_password OTPs
        Otp.query.filter_by(email=email, purpose='forgot_password', is_used=False).update({'is_used': True})
        
        otp_code = generate_numeric_otp()
        
        otp_entry = Otp(
            email=email,
            purpose='forgot_password',
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        otp_entry.set_otp(otp_code)
        
        db.session.add(otp_entry)
        db.session.commit()
        
        # Send OTP email
        email_sent = EmailService().send_otp_email(email, otp_code, 'forgot_password')
        if not email_sent:
            return error_response('Failed to send verification email. (Resend sandbox limit: emails can only be sent to account owner until a custom domain is verified)', status_code=500)
        
        return success_response('Password recovery code sent to your email')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Forgot password error: {str(e)}', status_code=500)


@auth_routes.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Verify OTP and reset user password
    
    Expected JSON:
    {
        "email": "john@example.com",
        "otp": "123456",
        "new_password": "NewPassword123!"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', status_code=400)
            
        email = data.get('email', '').strip()
        otp_code = data.get('otp', '').strip()
        new_password = data.get('new_password', '')
        
        if not email or not otp_code or not new_password:
            return error_response('Email, OTP code, and new password are required', status_code=400)
            
        # Validate new password
        valid, error = validate_password(new_password)
        if not valid:
            return error_response(error, status_code=422)
            
        otp_entry = Otp.query.filter_by(
            email=email,
            purpose='forgot_password',
            is_used=False
        ).filter(Otp.expires_at > datetime.utcnow()).order_by(Otp.created_at.desc()).first()
        
        if not otp_entry:
            return error_response('Verification code is invalid or has expired', status_code=400)
            
        if otp_entry.attempts >= 5:
            return error_response('Maximum verification attempts exceeded. Please try again.', status_code=400)
            
        if not otp_entry.check_otp(otp_code):
            otp_entry.attempts += 1
            db.session.commit()
            return error_response(f'Invalid verification code. {5 - otp_entry.attempts} attempts remaining.', status_code=400)
            
        # Success: reset password
        user = User.query.filter_by(email=email).first()
        if not user:
            return error_response('User not found', status_code=404)
            
        user.set_password(new_password)
        otp_entry.is_used = True
        db.session.commit()
        
        return success_response('Password reset successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Password reset error: {str(e)}', status_code=500)


@auth_routes.route('/change-password-otp', methods=['POST'])
@token_required
def change_password_otp(user, payload):
    """
    Request OTP for changing password
    
    Expected JSON:
    {
        "current_password": "CurrentPassword123!"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', status_code=400)
            
        current_password = data.get('current_password', '')
        if not current_password:
            return error_response('Current password is required to request verification code', status_code=400)
            
        # Verify current password
        if not user.check_password(current_password):
            return error_response('Current password is incorrect', status_code=401)
            
        # Invalidate old change_password OTPs
        Otp.query.filter_by(email=user.email, purpose='change_password', is_used=False).update({'is_used': True})
        
        otp_code = generate_numeric_otp()
        
        otp_entry = Otp(
            email=user.email,
            purpose='change_password',
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        otp_entry.set_otp(otp_code)
        
        db.session.add(otp_entry)
        db.session.commit()
        
        # Send OTP email
        email_sent = EmailService().send_otp_email(user.email, otp_code, 'change_password')
        if not email_sent:
            return error_response('Failed to send verification email. (Resend sandbox limit: emails can only be sent to account owner until a custom domain is verified)', status_code=500)
        
        return success_response('Verification code sent to your email')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Change password OTP request error: {str(e)}', status_code=500)


@auth_routes.route('/resend-otp', methods=['POST'])
def resend_otp():
    """
    Resend OTP for registration, forgot password, or change password
    Enforces a 60-second cooldown rate limit.
    
    Expected JSON:
    {
        "email": "john@example.com",
        "purpose": "register"
    }
    """
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', status_code=400)
            
        email = data.get('email', '').strip()
        purpose = data.get('purpose', '').strip()
        
        if not email or not purpose:
            return error_response('Email and purpose are required', status_code=400)
            
        # Enforce 60-second resend delay
        last_otp = Otp.query.filter_by(email=email, purpose=purpose).order_by(Otp.created_at.desc()).first()
        if last_otp:
            time_diff = datetime.utcnow() - last_otp.created_at
            if time_diff < timedelta(seconds=60):
                remaining = 60 - int(time_diff.total_seconds())
                return error_response(f'Please wait {remaining} seconds before requesting a new code.', status_code=429)
                
        # Invalidate old OTPs for this email and purpose
        Otp.query.filter_by(email=email, purpose=purpose, is_used=False).update({'is_used': True})
        
        # Retrieve signup data if registering
        signup_data = None
        if purpose == 'register':
            if not last_otp or not last_otp.signup_data:
                return error_response('No registration session found. Please register again.', status_code=404)
            signup_data = last_otp.signup_data
            
        otp_code = generate_numeric_otp()
        
        otp_entry = Otp(
            email=email,
            purpose=purpose,
            signup_data=signup_data,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        otp_entry.set_otp(otp_code)
        
        db.session.add(otp_entry)
        db.session.commit()
        
        # Send OTP email
        email_sent = EmailService().send_otp_email(email, otp_code, purpose)
        if not email_sent:
            return error_response('Failed to send verification email. (Resend sandbox limit: emails can only be sent to account owner until a custom domain is verified)', status_code=500)
        
        return success_response('Verification code resent successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Resend OTP error: {str(e)}', status_code=500)


@auth_routes.route('/logout', methods=['POST'])
@token_required
def logout(user, payload):
    """
    Logout user (client-side token deletion)
    """
    try:
        return success_response('Logout successful')
    
    except Exception as e:
        return error_response(f'Logout error: {str(e)}', status_code=500)



