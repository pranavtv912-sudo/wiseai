"""
Dashboard Analytics Routes
"""
from flask import Blueprint, jsonify, request
from utils.auth import token_required
from services.dashboard_service import DashboardService
import logging

dashboard_routes = Blueprint('dashboard_routes', __name__)
logger = logging.getLogger(__name__)

@dashboard_routes.route('/api/dashboard/overview', methods=['GET', 'OPTIONS'])
@token_required
def get_dashboard_overview(user, payload):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        service = DashboardService()
        stats = service.get_overview_stats(user.id)
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"Error fetching dashboard overview: {str(e)}")
        return jsonify({'error': str(e)}), 500

@dashboard_routes.route('/api/dashboard/charts', methods=['GET', 'OPTIONS'])
@token_required
def get_dashboard_charts(user, payload):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        service = DashboardService()
        charts = service.get_charts_data(user.id)
        return jsonify(charts), 200
    except Exception as e:
        logger.error(f"Error fetching dashboard charts: {str(e)}")
        return jsonify({'error': str(e)}), 500
