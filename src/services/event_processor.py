# Event processing and validation
from typing import Dict, Any, Optional
from src.models.event import GitHubEvent, EventAction

def process_webhook_payload(event_type: str, payload: Dict[str, Any]) -> Optional[GitHubEvent]:
    """Process and validate GitHub webhook payload"""
    # Validate required fields
    if not event_type or not payload:
        return None

    # Parse the event
    from src.services.github_parser import parse_github_event
    event_data = parse_github_event(event_type, payload)

    if not event_data:
        return None

    # Validate all required fields are present
    required_fields = ['request_id', 'author', 'action', 'to_branch', 'timestamp']
    if not all(event_data.get(field) for field in required_fields):
        return None

    # Ensure action is valid
    try:
        event_data['action'] = EventAction(event_data['action'])
    except ValueError:
        return None

    return GitHubEvent(**event_data)

def get_event_display_text(event: GitHubEvent) -> str:
    """Generate display text for UI according to spec"""
    templates = {
        EventAction.PUSH: '{author} pushed to {to_branch}',
        EventAction.PULL_REQUEST: '{author} submitted a pull request from {from_branch} to {to_branch}',
        EventAction.MERGE: '{author} merged branch {from_branch} to {to_branch}',
    }

    template = templates.get(event.action)
    if not template:
        return f"{event.author} performed {event.action.value}"

    return template.format(
        author=event.author,
        from_branch=event.from_branch or '',
        to_branch=event.to_branch
    )
