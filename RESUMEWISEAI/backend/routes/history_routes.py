from datetime import datetime
from flask import Blueprint, request
from models import db, LearningHistory
from utils import token_required, success_response, error_response

history_routes = Blueprint('history', __name__, url_prefix='/api/history')


@history_routes.route('', methods=['GET'])
@token_required
def get_history(user, payload):
    try:
        history_items = LearningHistory.query.filter_by(user_id=user.id).order_by(LearningHistory.watched_at.desc()).all()
        return success_response('Learning history retrieved successfully', {
            'history': [item.to_dict() for item in history_items]
        })
    except Exception as e:
        return error_response(f'Error retrieving history: {str(e)}', status_code=500)


@history_routes.route('/add', methods=['POST'])
@token_required
def add_history(user, payload):
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', status_code=400)

        video_id = data.get('videoId', '').strip()
        video_title = data.get('videoTitle', '').strip()
        skill_name = data.get('skillName', '').strip()
        watched_at_value = data.get('watchedAt')

        if not video_id:
            return error_response('videoId is required', status_code=400)
        if not video_title:
            return error_response('videoTitle is required', status_code=400)
        if not skill_name:
            return error_response('skillName is required', status_code=400)

        watched_at = None
        if watched_at_value:
            try:
                watched_at = datetime.fromisoformat(watched_at_value)
            except Exception:
                return error_response('watchedAt must be ISO8601 datetime string', status_code=422)

        history_item = LearningHistory(
            user_id=user.id,
            video_id=video_id,
            video_title=video_title,
            skill_name=skill_name,
            watched_at=watched_at or datetime.utcnow()
        )

        db.session.add(history_item)
        db.session.commit()

        return success_response('Learning history item added successfully', {
            'history': history_item.to_dict()
        }, status_code=201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'Error adding learning history: {str(e)}', status_code=500)
