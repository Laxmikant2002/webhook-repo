"""
GitHub Webhook Monitor - Flask Application Factory
TechStaX Developer Assessment
"""
from flask import Flask
from src.config import Config
from src.extensions import mongo


def create_app(config_class=Config):
    """
    Flask application factory.
    
    Args:
        config_class: Configuration class to use
        
    Returns:
        Flask application instance
    """
    app = Flask(
        __name__,
        template_folder='../templates',
        static_folder='static'
    )
    app.config.from_object(config_class)
    
    # Initialize extensions
    mongo.init_app(app)
    
    # Register blueprints
    from src.routes.webhook import webhook_bp
    from src.routes.api import api_bp
    from src.routes.views import views_bp
    
    app.register_blueprint(webhook_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(views_bp)
    
    # Create MongoDB indexes
    with app.app_context():
        from src.models.repository import ensure_indexes
        ensure_indexes()
    
    return app