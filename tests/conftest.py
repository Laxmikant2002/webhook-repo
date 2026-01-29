# Test configuration and fixtures
import pytest
from src import create_app
from src.config import TestConfig

@pytest.fixture
def app():
    """Create and configure a test app instance."""
    app = create_app(TestConfig)
    return app

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()