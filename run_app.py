import sys
import os

# Add the current directory to Python path so 'src' module can be found
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Now import and run the app
from src import create_app

app = create_app()

if __name__ == '__main__':
    # For development only
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=app.config['DEBUG']
    )