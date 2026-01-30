import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    MONGO_URI = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/github_events')
    WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET', '')
    EVENTS_LIMIT = int(os.environ.get('EVENTS_LIMIT', 50))

class TestConfig(Config):
    TESTING = True
    MONGO_URI = 'mongodb://localhost:27017/test_github_events'
    SECRET_KEY = 'test-secret-key'
    WEBHOOK_SECRET = 'test-webhook-secret'
