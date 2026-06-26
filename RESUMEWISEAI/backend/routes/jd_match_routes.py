"""
Routes for JD Match feature
"""
from flask import Blueprint, request, jsonify
from utils.auth import token_required
from services.jd_match_service import JDMatchService
import logging

jd_match_routes = Blueprint('jd_match_routes', __name__)
logger = logging.getLogger(__name__)

@jd_match_routes.route('/api/jd-match', methods=['POST', 'OPTIONS'])
@token_required
def analyze_jd_match(user, payload):
    """
    Endpoint to analyze a resume against a job description
    """
    if request.method == 'OPTIONS':
        return '', 200

    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
            
        resume_id = data.get('resumeId')
        job_description = data.get('jobDescription')
        
        if not resume_id or not job_description:
            return jsonify({
                'success': False,
                'message': 'Missing resumeId or jobDescription'
            }), 400

        service = JDMatchService()
        result = service.analyze_match(resume_id, job_description)

        return jsonify({
            'success': True,
            'message': 'Analysis completed successfully',
            'data': result
        }), 200

    except ValueError as ve:
        logger.error(f"Validation Error in jd_match: {str(ve)}")
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 400
    except Exception as e:
        logger.error(f"Error in analyze_jd_match route: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred during analysis.'
        }), 500
