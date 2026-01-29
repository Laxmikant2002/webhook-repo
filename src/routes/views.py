# src/routes/views.py - Web page routes
from flask import Blueprint, render_template, current_app
from src.utils.constants import POLLING_INTERVAL_MS

views_bp = Blueprint('views', __name__)

@views_bp.route('/', methods=['GET'])
def index():
    """
    Main dashboard page.

    Serves the HTML page that displays real-time GitHub activity.
    """
    current_app.logger.debug('Serving index page')
    return render_template('index.html', polling_interval=POLLING_INTERVAL_MS)

@views_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.

    Used by load balancers and monitoring systems to verify service health.
    """
    return {
        'status': 'healthy',
        'service': 'github-webhook-monitor',
        'version': '1.0.0'
    }, 200
