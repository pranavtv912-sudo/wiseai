"""
Routes for AI Career Assistant Chat
"""
from flask import Blueprint, request, jsonify
from utils.auth import token_required
from services.chat_service import ChatService
import logging

chat_routes = Blueprint('chat_routes', __name__)
logger = logging.getLogger(__name__)

@chat_routes.route('/api/chat', methods=['POST', 'OPTIONS'])
@token_required
def chat_with_assistant(user, payload):
    """
    Endpoint for communicating with the AI Assistant
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
            
        message = data.get('message')
        
        if not message:
            return jsonify({
                'success': False,
                'message': 'Message is required'
            }), 400

        service = ChatService()
        # We pass the user's ID to fetch context
        response_text = service.get_chat_response(user_id=user.id, message=message)

        return jsonify({
            'success': True,
            'message': 'Response generated successfully',
            'data': {
                'response': response_text
            }
        }), 200

    except ValueError as ve:
        logger.error(f"Validation Error in chat route: {str(ve)}")
        return jsonify({
            'success': False,
            'message': str(ve)
        }), 400
    except Exception as e:
        logger.error(f"Error in chat route: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while generating the response.'
        }), 500
