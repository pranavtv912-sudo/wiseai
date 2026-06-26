"""
Input Validation Utilities
Validates user input for email, password, and other fields
"""

import re
import string


def validate_email(email):
    """
    Validate email format
    
    Args:
        email: Email address to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not email:
        return False, 'Email is required'
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, 'Invalid email format'
    
    if len(email) > 255:
        return False, 'Email is too long'
    
    return True, None


def validate_password(password):
    """
    Validate password strength
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password:
        return False, 'Password is required'
    
    if len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    
    if len(password) > 128:
        return False, 'Password is too long'
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    if not (has_upper and has_lower and has_digit):
        return False, 'Password must contain uppercase, lowercase, and numbers'
    
    return True, None


def validate_name(name):
    """
    Validate name field
    
    Args:
        name: Name to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not name:
        return False, 'Name is required'
    
    if len(name) < 2:
        return False, 'Name must be at least 2 characters'
    
    if len(name) > 255:
        return False, 'Name is too long'
    
    return True, None


def validate_phone(phone):
    """
    Validate phone number
    
    Args:
        phone: Phone number to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not phone:
        return True, None  # Phone is optional
    
    phone_pattern = r'^[\d\s\-\+\(\)]{7,}$'
    if not re.match(phone_pattern, phone):
        return False, 'Invalid phone number format'
    
    return True, None


def validate_url(url):
    """
    Validate URL format
    
    Args:
        url: URL to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not url:
        return True, None  # URL is optional
    
    url_pattern = r'^https?:\/\/.+$'
    if not re.match(url_pattern, url):
        return False, 'Invalid URL format'
    
    return True, None


def validate_required_fields(data, required_fields):
    """
    Validate that required fields are present
    
    Args:
        data: Dictionary of data to validate
        required_fields: List of required field names
        
    Returns:
        Tuple of (is_valid, error_messages)
    """
    errors = []
    
    for field in required_fields:
        if field not in data or not data[field]:
            errors.append(f'{field} is required')
    
    return len(errors) == 0, errors


def sanitize_input(text):
    """
    Sanitize user input to prevent XSS
    
    Args:
        text: Text to sanitize
        
    Returns:
        Sanitized text
    """
    if not isinstance(text, str):
        return text
    
    # Remove dangerous characters and tags
    dangerous_chars = ['<', '>', '"', "'", '&']
    for char in dangerous_chars:
        text = text.replace(char, '')
    
    return text.strip()
