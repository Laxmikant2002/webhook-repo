"""
Flask extensions initialization.
Extensions are initialized here and imported where needed.
"""
from flask_pymongo import PyMongo

# MongoDB extension instance
mongo = PyMongo()
