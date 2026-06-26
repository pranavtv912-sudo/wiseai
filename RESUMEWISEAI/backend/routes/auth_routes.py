"""
Authentication Routes
Handles user registration, login, and profile management
"""

from flask import Blueprint, request, current_app
from models import User, db
from utils import generate_tokens, success_response, error_response, validate_email, validate_password, validate_name, token_required

auth_routes = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_routes.route('/register', methods=['POST'])
def register():
    """
    User registration endpoint
    
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
        
        # Create new user
        user = User(
            name=name,
            email=email
        )
        user.set_password(password)
        
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
        "new_password": "NewPassword123!"
    }
    """
    try:
        data = request.get_json()
        
        old_password = data.get('old_password', '')
        new_password = data.get('new_password', '')
        
        if not old_password or not new_password:
            return error_response('Both old and new passwords are required', status_code=400)
        
        # Verify old password
        if not user.check_password(old_password):
            return error_response('Old password is incorrect', status_code=401)
        
        # Validate new password
        valid, error = validate_password(new_password)
        if not valid:
            return error_response(error, status_code=422)
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        return success_response('Password changed successfully')
    
    except Exception as e:
        db.session.rollback()
        return error_response(f'Error changing password: {str(e)}', status_code=500)


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
