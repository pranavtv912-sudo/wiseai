"""
Job Roles Routes
Provides API endpoints to fetch available target job roles
"""

from flask import Blueprint, jsonify, request
from models import db, JobRole

roles_routes = Blueprint('roles_routes', __name__)


@roles_routes.route('/api/roles', methods=['GET'])
def get_all_roles():
    """
    GET /api/roles
    Returns all active job roles, optionally filtered by category.
    Query params:
        category (str): Filter by category name (optional)
        search   (str): Partial match on role title (optional)
    """
    try:
        query = JobRole.query.filter_by(is_active=True)

        category = request.args.get('category', '').strip()
        if category:
            query = query.filter_by(category=category)

        search = request.args.get('search', '').strip()
        if search:
            query = query.filter(JobRole.title.ilike(f'%{search}%'))

        roles = query.order_by(JobRole.category, JobRole.title).all()

        # Build category-grouped response
        grouped = {}
        for role in roles:
            cat = role.category or 'Other'
            grouped.setdefault(cat, []).append(role.to_dict())

        return jsonify({
            'success': True,
            'message': f'{len(roles)} roles found',
            'data': {
                'roles': [r.to_dict() for r in roles],
                'grouped': grouped,
                'total': len(roles),
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error fetching roles: {str(e)}',
            'data': None
        }), 500


@roles_routes.route('/api/roles/categories', methods=['GET'])
def get_categories():
    """GET /api/roles/categories — Returns list of unique categories"""
    try:
        categories = (
            db.session.query(JobRole.category)
            .filter(JobRole.is_active == True, JobRole.category != None)
            .distinct()
            .order_by(JobRole.category)
            .all()
        )
        return jsonify({
            'success': True,
            'message': 'Categories fetched',
            'data': [c[0] for c in categories]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e),
            'data': None
        }), 500
