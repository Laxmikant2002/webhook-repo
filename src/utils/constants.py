# Constants and configuration
from enum import Enum

class GitHubEventType(str, Enum):
    PUSH = "push"
    PULL_REQUEST = "pull_request"
    PING = "ping"

class EventAction(str, Enum):
    PUSH = "PUSH"
    PULL_REQUEST = "PULL_REQUEST"
    MERGE = "MERGE"

# Polling interval for frontend (in milliseconds)
POLLING_INTERVAL_MS = 15000  # 15 seconds

# MongoDB collection names
EVENTS_COLLECTION = "events"

# GitHub webhook headers
GITHUB_EVENT_HEADER = "X-GitHub-Event"
GITHUB_SIGNATURE_HEADER = "X-Hub-Signature-256"
GITHUB_DELIVERY_HEADER = "X-GitHub-Delivery"

# Legacy constants for backward compatibility
DEFAULT_EVENTS_LIMIT = 50
UI_POLLING_INTERVAL = POLLING_INTERVAL_MS

# GitHub event types (legacy)
GITHUB_EVENTS = {
    'PUSH': 'push',
    'PULL_REQUEST': 'pull_request',
    'MERGE': 'pull_request'  # Merge is detected from pull_request closed + merged
}

# Supported event actions (legacy)
EVENT_ACTIONS = ['PUSH', 'PULL_REQUEST', 'MERGE']

# MongoDB collection names (legacy)
COLLECTIONS = {
    'EVENTS': 'events'
}
