"""
File Upload and Validation Utilities
Handles file uploads, validation, and storage
"""

import os
from werkzeug.utils import secure_filename
from flask import current_app
import mimetypes


def is_allowed_file(filename):
    """
    Check if file extension is allowed
    
    Args:
        filename: Name of the file to check
        
    Returns:
        Boolean indicating if file is allowed
    """
    allowed = current_app.config['ALLOWED_EXTENSIONS']
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


def get_file_extension(filename):
    """Get file extension from filename"""
    return filename.rsplit('.', 1)[1].lower() if '.' in filename else ''


def save_uploaded_file(file, folder='uploads'):
    """
    Save uploaded file to disk
    
    Args:
        file: FileStorage object
        folder: Folder to save file in (relative to UPLOAD_FOLDER)
        
    Returns:
        Dictionary with file information or error
    """
    try:
        if not file or file.filename == '':
            return {'error': 'No file selected'}
        
        if not is_allowed_file(file.filename):
            return {'error': f'File type not allowed. Allowed types: {", ".join(current_app.config["ALLOWED_EXTENSIONS"])}'}
        
        # Create secure filename
        filename = secure_filename(file.filename)
        
        # Create folder if it doesn't exist
        upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], folder)
        os.makedirs(upload_folder, exist_ok=True)
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > current_app.config['MAX_CONTENT_LENGTH']:
            return {'error': f'File too large. Maximum size: {current_app.config["MAX_CONTENT_LENGTH"] / (1024*1024)}MB'}
        
        # Generate unique filename
        import uuid
        import time
        unique_filename = f"{uuid.uuid4()}_{int(time.time())}_{filename}"
        filepath = os.path.join(upload_folder, unique_filename)
        
        # Save file
        file.save(filepath)
        
        return {
            'success': True,
            'filename': unique_filename,
            'filepath': filepath,
            'original_name': filename,
            'file_size': file_size,
            'extension': get_file_extension(filename)
        }
    
    except Exception as e:
        return {'error': f'Error saving file: {str(e)}'}


def delete_uploaded_file(filepath):
    """
    Delete uploaded file from disk
    
    Args:
        filepath: Full path to file
        
    Returns:
        Boolean indicating success
    """
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False
    except Exception as e:
        print(f'Error deleting file: {str(e)}')
        return False


def validate_file_size(file, max_size_mb=16):
    """
    Validate file size
    
    Args:
        file: FileStorage object
        max_size_mb: Maximum file size in MB
        
    Returns:
        Boolean indicating if file is valid
    """
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    max_size_bytes = max_size_mb * 1024 * 1024
    return file_size <= max_size_bytes


def get_file_mime_type(filename):
    """Get MIME type of file"""
    mime_type, _ = mimetypes.guess_type(filename)
    return mime_type or 'application/octet-stream'
