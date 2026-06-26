"""
Routes for AI Resume Builder
"""
from flask import Blueprint, request, jsonify, send_file
from utils.auth import token_required
from services.resume_builder_service import ResumeBuilderService
import logging

resume_builder_routes = Blueprint('resume_builder_routes', __name__)
logger = logging.getLogger(__name__)

@resume_builder_routes.route('/api/resume-builder/generate', methods=['POST', 'OPTIONS'])
@token_required
def generate_or_prefill(user, payload):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json() or {}
        action = data.get('action', 'prefill')
        service = ResumeBuilderService()

        if action == 'prefill':
            result = service.get_prefill_data(user.id)
            return jsonify({'success': True, 'data': result}), 200
        
        elif action in ['improve_summary', 'improve_bullets', 'generate_objective']:
            text_data = data.get('data', '')
            role_context = data.get('role', 'Professional')
            if not text_data:
                return jsonify({'success': False, 'message': 'No text data provided for AI improvement.'}), 400
                
            improved_text = service.ai_improve(action, text_data, role_context)
            return jsonify({'success': True, 'data': improved_text}), 200
            
        else:
            return jsonify({'success': False, 'message': 'Unknown action.'}), 400

    except Exception as e:
        logger.error(f"Error in generate_or_prefill: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@resume_builder_routes.route('/api/resume-builder/update', methods=['PUT', 'OPTIONS'])
@token_required
def update_resume(user, payload):
    # We are keeping this stateless on the backend to avoid schema changes.
    # The frontend will rely on localStorage for auto-save.
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({'success': True, 'message': 'Auto-save handled by client.'}), 200

@resume_builder_routes.route('/api/resume-builder/template-list', methods=['GET', 'OPTIONS'])
@token_required
def get_templates(user, payload):
    if request.method == 'OPTIONS':
        return '', 200
    templates = [
        {"id": "modern", "name": "Modern", "description": "Clean, colorful, and modern."},
        {"id": "professional", "name": "Professional", "description": "Classic and formal."},
        {"id": "minimal", "name": "Minimal", "description": "Simple and ATS-friendly."}
    ]
    return jsonify({'success': True, 'data': templates}), 200

@resume_builder_routes.route('/api/resume-builder/preview', methods=['GET', 'OPTIONS'])
@token_required
def preview_resume(user, payload):
    # Preview is handled natively in React for a better real-time experience.
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({'success': True, 'message': 'Live preview rendered by client.'}), 200

@resume_builder_routes.route('/api/resume-builder/download', methods=['POST', 'OPTIONS'])
@token_required
def download_resume(user, payload):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        if not data or 'resume_data' not in data:
            return jsonify({'success': False, 'message': 'No resume data provided.'}), 400
            
        resume_data = data.get('resume_data')
        template_style = data.get('template', 'Modern')
        
        service = ResumeBuilderService()
        pdf_buffer = service.generate_pdf(resume_data, template_style)
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name='Resume.pdf',
            mimetype='application/pdf'
        )
    except Exception as e:
        logger.error(f"Error in download_resume: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500
