from src.extensions import mongo
from src.models.event import GitHubEvent

def save_event(event: GitHubEvent):
    try:
        result = mongo.db.events.update_one(
            {'request_id': event.request_id},
            {'$setOnInsert': event.to_dict()},
            upsert=True
        )
        return result.upserted_id is not None
    except Exception as e:
        if 'duplicate key' in str(e).lower():
            return False
        print(f"Could not save event to MongoDB: {e}")
        return False

def get_recent_events(limit: int = 50):
    try:
        events = mongo.db.events.find(
            {},
            {'_id': 0, 'request_id': 1, 'author': 1, 'action': 1,
             'from_branch': 1, 'to_branch': 1, 'timestamp': 1}
        ).sort('created_at', -1).limit(limit)
        return list(events)
    except Exception as e:
        print(f"Could not retrieve events from MongoDB: {e}")
        return []

def ensure_indexes():
    mongo.db.events.create_index('request_id', unique=True)
    mongo.db.events.create_index('created_at')
    mongo.db.events.create_index('author')
    mongo.db.events.create_index('action')