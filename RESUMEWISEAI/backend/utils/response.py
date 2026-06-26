"""
Response and Error Handling Utilities
Standardized response format for all API endpoints
"""

from flask import jsonify
from functools import wraps


def api_response(success, message, data=None, status_code=200):
    """
    Create standardized API response
    
    Args:
        success: Boolean indicating success
        message: Response message
        data: Response data (optional)
        status_code: HTTP status code
        
    Returns:
        Flask response with JSON and status code
    """
    response = {
        'success': success,
        'message': message,
        'data': data
    }
    return jsonify(response), status_code


def success_response(message, data=None, status_code=200):
    """Create successful API response"""
    return api_response(True, message, data, status_code)


def error_response(message, data=None, status_code=400):
    """Create error API response"""
    return api_response(False, message, data, status_code)


def not_found_response(resource='Resource'):
    """Create not found response"""
    return error_response(f'{resource} not found', status_code=404)


def unauthorized_response(message='Unauthorized access'):
    """Create unauthorized response"""
    return error_response(message, status_code=401)


def forbidden_response(message='Access forbidden'):
    """Create forbidden response"""
    return error_response(message, status_code=403)


def validation_error_response(errors, status_code=422):
    """Create validation error response"""
    return error_response('Validation failed', {'errors': errors}, status_code)


def paginated_response(items, total, page, per_page, message='Success'):
    """
    Create paginated response
    
    Args:
        items: List of items
        total: Total number of items
        page: Current page number
        per_page: Items per page
        message: Response message
        
    Returns:
        Flask response with pagination data
    """
    return success_response(message, {
        'items': items,
        'pagination': {
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page
        }
    })


def handle_errors(f):
    """
    Decorator to handle exceptions and return error responses
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            return validation_error_response(str(e))
        except PermissionError as e:
            return forbidden_response(str(e))
        except Exception as e:
            return error_response(f'An error occurred: {str(e)}', status_code=500)
    
    return decorated
