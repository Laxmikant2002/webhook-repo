from flask import Flask
from src.config import Config
from src.extensions import mongo

def create_app(config_class=Config):
    app = Flask(
        __name__,
        template_folder='../templates',
        static_folder='static'
    )
    app.config.from_object(config_class)
    
    mongo.init_app(app)
    
    from src.routes.webhook import webhook_bp
    from src.routes.api import api_bp
    from src.routes.views import views_bp
    
    app.register_blueprint(webhook_bp)
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(views_bp)
    
    with app.app_context():
        try:
            from src.models.repository import ensure_indexes
            ensure_indexes()
        except Exception as e:
            if app.config['DEBUG']:
                print(f"Warning: Could not create MongoDB indexes: {e}")
    
    return app