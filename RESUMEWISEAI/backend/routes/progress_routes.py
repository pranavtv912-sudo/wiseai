from flask import Blueprint, request
from models import db, UserProgress
from utils import token_required, success_response, error_response

progress_routes = Blueprint('progress', __name__, url_prefix='/api/progress')


@progress_routes.route('', methods=['GET'])
@token_required
def get_progress(user, payload):
    try:
        progress_items = UserProgress.query.filter_by(user_id=user.id).all()
        return success_response('Progress retrieved successfully', {
            'progress': [item.to_dict() for item in progress_items]
        })
    except Exception as e:
        return error_response(f'Error retrieving progress: {str(e)}', status_code=500)


@progress_routes.route('/update', methods=['POST'])
@token_required
def update_progress(user, payload):
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', status_code=400)

        skill_name = data.get('skillName', '').strip()
        progress_percentage = data.get('progressPercentage')
        completed = data.get('completed', False)

        if not skill_name:
            return error_response('skillName is required', status_code=400)

        if progress_percentage is None:
            return error_response('progressPercentage is required', status_code=400)

        try:
            progress_percentage = float(progress_percentage)
        except (TypeError, ValueError):
            return error_response('progressPercentage must be a number', status_code=422)

        if progress_percentage < 0 or progress_percentage > 100:
            return error_response('progressPercentage must be between 0 and 100', status_code=422)

        progress_item = UserProgress.query.filter_by(user_id=user.id, skill_name=skill_name).first()

        if not progress_item:
            progress_item = UserProgress(
                user_id=user.id,
                skill_name=skill_name,
                progress_percentage=progress_percentage,
                completed=bool(completed)
            )
            db.session.add(progress_item)
        else:
            progress_item.progress_percentage = progress_percentage
            progress_item.completed = bool(completed)

        db.session.commit()

        return success_response('Progress updated successfully', {
            'progress': progress_item.to_dict()
        }, status_code=201)

    except Exception as e:
        db.session.rollback()
        return error_response(f'Error updating progress: {str(e)}', status_code=500)
