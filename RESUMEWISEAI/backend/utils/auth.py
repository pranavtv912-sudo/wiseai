"""
JWT Authentication Utilities
Handles JWT token generation, validation, and user verification
"""

import jwt
from functools import wraps
from datetime import datetime
from flask import request, current_app
from models import User


def generate_tokens(user_id):
    """
    Generate access and refresh tokens for user
    
    Args:
        user_id: User ID to encode in token
        
    Returns:
        Dictionary with access_token and refresh_token
    """
    try:
        secret = current_app.config['JWT_SECRET_KEY']
        access_expires = current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        refresh_expires = current_app.config['JWT_REFRESH_TOKEN_EXPIRES']
        
        access_payload = {
            'user_id': user_id,
            'type': 'access',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + access_expires
        }
        
        refresh_payload = {
            'user_id': user_id,
            'type': 'refresh',
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + refresh_expires
        }
        
        access_token = jwt.encode(access_payload, secret, algorithm='HS256')
        refresh_token = jwt.encode(refresh_payload, secret, algorithm='HS256')
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': int(access_expires.total_seconds())
        }
    except Exception as e:
        raise Exception(f'Error generating tokens: {str(e)}')


def verify_token(token):
    """
    Verify JWT token and return payload
    
    Args:
        token: JWT token to verify
        
    Returns:
        Token payload if valid, None if invalid
    """
    try:
        secret = current_app.config['JWT_SECRET_KEY']
        payload = jwt.decode(token, secret, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception('Token has expired')
    except jwt.InvalidTokenError:
        raise Exception('Invalid token')


def token_required(f):
    """
    Decorator to protect routes requiring authentication
    Extracts and validates JWT token from Authorization header
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return f(None, None, *args, **kwargs)

        token = None
        
        # Extract token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return {
                    'success': False,
                    'message': 'Invalid authorization header format'
                }, 401
        
        if not token:
            return {
                'success': False,
                'message': 'Authorization token is missing'
            }, 401
        
        try:
            payload = verify_token(token)
            print("TOKEN RECEIVED:", token)
            print("PAYLOAD:", payload)
            
            # Verify token type is 'access'
            if payload.get('type') != 'access':
                return {
                    'success': False,
                    'message': 'Invalid token type'
                }, 401
            
            # Get user from database
            user = User.query.get(payload['user_id'])

            print("USER:", user)
            
            if user:
                print("ACTIVE:", user.is_active)
               
            if not user or not user.is_active:
                return {
                    'success': False,
                    'message': 'User not found or inactive'
                }, 401
            
            # Pass user and payload to route handler
            return f(user, payload, *args, **kwargs)
            
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 401
    
    return decorated


def admin_required(f):
    """
    Decorator to protect routes requiring admin privileges
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return {
                    'success': False,
                    'message': 'Invalid authorization header format'
                }, 401
        
        if not token:
            return {
                'success': False,
                'message': 'Authorization token is missing'
            }, 401
        
        try:
            payload = verify_token(token)
            
            if payload.get('type') != 'access':
                return {
                    'success': False,
                    'message': 'Invalid token type'
                }, 401
            
            user = User.query.get(payload['user_id'])
            if not user or not user.is_active:
                return {
                    'success': False,
                    'message': 'User not found or inactive'
                }, 401
            
            # Check admin status (you can add an is_admin field to User model)
            if not getattr(user, 'is_admin', False):
                return {
                    'success': False,
                    'message': 'Admin access required'
                }, 403
            
            return f(user, payload, *args, **kwargs)
            
        except Exception as e:
            return {
                'success': False,
                'message': str(e)
            }, 401
    
    return decorated
