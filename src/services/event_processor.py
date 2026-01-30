from typing import Dict, Any, Optional
from src.models.event import GitHubEvent, EventAction

def process_webhook_payload(event_type: str, payload: Dict[str, Any]) -> Optional[GitHubEvent]:
    if not event_type or not payload:
        return None

    from src.services.github_parser import parse_github_event
    event_data = parse_github_event(event_type, payload)

    if not event_data:
        return None

    required_fields = ['request_id', 'author', 'action', 'to_branch', 'timestamp']
    if not all(event_data.get(field) for field in required_fields):
        return None

    try:
        event_data['action'] = EventAction(event_data['action'])
    except ValueError:
        return None

    return GitHubEvent(**event_data)
