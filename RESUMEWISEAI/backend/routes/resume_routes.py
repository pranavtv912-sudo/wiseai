"""
Resume Management Routes
Handles resume upload, retrieval, and deletion
"""

from flask import Blueprint, request, current_app, send_file
from models import User, Resume, db
from utils import token_required, success_response, error_response, save_uploaded_file, delete_uploaded_file
from services import ResumeParser
from datetime import datetime
import os

resume_routes = Blueprint('resume', __name__, url_prefix='/api/resume')


@resume_routes.route('/upload', methods=['POST'])
@token_required
def upload_resume(user, payload):
    """
    Upload resume file
    
    Expected: Multipart form data with 'file' and optionally 'target_role'
    """
    try:
        if 'file' not in request.files:
            return error_response('No file provided', status_code=400)
        
        file = request.files['file']
        target_role = request.form.get('target_role', '')
        
        if file.filename == '':
            return error_response('No file selected', status_code=400)
        
        # Save file
        result = save_uploaded_file(file, folder=f'resumes/{user.id}')
        
        if 'error' in result:
            return error_response(result['error'], status_code=400)
        
        # Create resume record
        resume = Resume(
            user_id=user.id,
            file_name=result['filename'],
            file_path=result['filepath'],
            original_name=result['original_name'],
            file_type=result['extension'],
            file_size=result['file_size'],
            target_role=target_role if target_role else None,
            analysis_status='pending'
        )
        
        db.session.add(resume)
        db.session.commit()
        
        return success_response('Resume uploaded successfully', {
            'resume': resume.to_dict()
        }, status_code=201)
    
    except Exception as e:
        db.session.rollback()
        return error_response(f'Upload error: {str(e)}', status_code=500)


@resume_routes.route('/<resume_id>', methods=['GET'])
@token_required
def get_resume(user, payload, resume_id):
    """
    Get resume details
    """
    try:
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        
        if not resume:
            return error_response('Resume not found', status_code=404)
        
        resume_data = resume.to_dict()
        
        # Add analysis if available
        if resume.analysis:
            resume_data['analysis'] = resume.analysis.to_dict()
        
        return success_response('Resume retrieved successfully', {
            'resume': resume_data
        })
    
    except Exception as e:
        return error_response(f'Error retrieving resume: {str(e)}', status_code=500)


@resume_routes.route('/<resume_id>', methods=['DELETE'])
@token_required
def delete_resume(user, payload, resume_id):
    """
    Delete resume file and record
    """
    try:
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        
        if not resume:
            return error_response('Resume not found', status_code=404)
        
        # Delete file
        if os.path.exists(resume.file_path):
            delete_uploaded_file(resume.file_path)
        
        # Delete database record
        db.session.delete(resume)
        db.session.commit()
        
        return success_response('Resume deleted successfully')
    
    except Exception as e:
        db.session.rollback()
        return error_response(f'Error deleting resume: {str(e)}', status_code=500)


@resume_routes.route('/list', methods=['GET'])
@token_required
def list_resumes(user, payload):
    """
    List all resumes for authenticated user
    
    Query params:
    - page: Page number (default 1)
    - per_page: Items per page (default 20)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Pagination
        resumes = Resume.query.filter_by(user_id=user.id).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        resume_list = [r.to_dict() for r in resumes.items]
        
        return success_response('Resumes retrieved successfully', {
            'resumes': resume_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': resumes.total,
                'pages': resumes.pages
            }
        })
    
    except Exception as e:
        return error_response(f'Error listing resumes: {str(e)}', status_code=500)


@resume_routes.route('/<resume_id>/download', methods=['GET'])
@token_required
def download_resume(user, payload, resume_id):
    """
    Download resume file
    """
    try:
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        
        if not resume:
            return error_response('Resume not found', status_code=404)
        
        if not os.path.exists(resume.file_path):
            return error_response('File not found', status_code=404)
        
        return send_file(
            resume.file_path,
            as_attachment=True,
            download_name=resume.original_name
        )
    
    except Exception as e:
        return error_response(f'Error downloading resume: {str(e)}', status_code=500)


@resume_routes.route('/<resume_id>/parse', methods=['POST'])
@token_required
def parse_resume(user, payload, resume_id):
    """
    Parse resume and extract text/data
    """
    try:
        resume = Resume.query.filter_by(id=resume_id, user_id=user.id).first()
        
        if not resume:
            return error_response('Resume not found', status_code=404)
        
        # Parse resume
        parser = ResumeParser()
        parsed_data = parser.parse_resume(resume.file_path)
        
        if 'error' in parsed_data:
            return error_response(parsed_data['error'], status_code=400)
        
        # Update resume with extracted data
        resume.extracted_text = parsed_data.get('raw_text', '')
        resume.extracted_skills = parsed_data.get('skills', [])
        resume.extracted_experience = parsed_data.get('experience', [])
        resume.extracted_education = parsed_data.get('education', [])
        resume.extracted_certifications = parsed_data.get('certifications', [])
        resume.extracted_projects = parsed_data.get('projects', [])
        resume.analysis_status = 'ready_for_analysis'
        
        db.session.commit()
        
        return success_response('Resume parsed successfully', {
            'parsed_data': {
                'skills': parsed_data.get('skills', []),
                'experience': parsed_data.get('experience', []),
                'education': parsed_data.get('education', []),
                'certifications': parsed_data.get('certifications', []),
                'projects': parsed_data.get('projects', []),
                'contact_info': parsed_data.get('contact_info', {}),
                'keywords': parsed_data.get('keywords', [])
            }
        })
    
    except Exception as e:
        db.session.rollback()
        return error_response(f'Error parsing resume: {str(e)}', status_code=500)
