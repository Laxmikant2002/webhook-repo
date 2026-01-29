#!/usr/bin/env python3
"""
GitHub Webhook Monitor - Application Entry Point
TechStaX Developer Assessment
"""
import os
from src import create_app

app = create_app()

if __name__ == '__main__':
    # For development only
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=app.config['DEBUG']
    )