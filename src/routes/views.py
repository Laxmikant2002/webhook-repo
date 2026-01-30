from flask import Blueprint, render_template

views_bp = Blueprint('views', __name__)

@views_bp.route('/')
def index():
    return render_template('index.html')

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
