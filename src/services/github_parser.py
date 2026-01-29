# Parse GitHub webhook payloads
import re
from datetime import datetime
from typing import Optional, Dict, Any
from src.utils.formatters import format_timestamp_with_ordinal

def parse_github_event(event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Main parser for GitHub events"""
    parsers = {
        'push': parse_push_event,
        'pull_request': parse_pull_request_event,
    }

    parser = parsers.get(event_type)
    if not parser:
        return None

    return parser(payload)

def parse_push_event(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Parse push event payload"""
    # Extract branch name from ref (refs/heads/main -> main)
    ref = payload.get('ref', '')
    branch_match = re.match(r'^refs/heads/(.+)$', ref)
    to_branch = branch_match.group(1) if branch_match else ref

    # Get timestamp from head_commit or use current time
    head_commit = payload.get('head_commit', {})
    timestamp = head_commit.get('timestamp') or payload.get('repository', {}).get('pushed_at')

    return {
        'request_id': payload.get('after', ''),  # Commit SHA
        'author': payload.get('pusher', {}).get('name', 'Unknown'),
        'action': 'PUSH',
        'from_branch': None,
        'to_branch': to_branch,
        'timestamp': format_timestamp_with_ordinal(timestamp) if timestamp else '',
    }

def parse_pull_request_event(payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Parse pull request event - includes merge detection"""
    pr = payload.get('pull_request', {})
    action = payload.get('action', '')

    # Determine event type
    if action == 'closed' and pr.get('merged', False):
        event_action = 'MERGE'
    elif action == 'opened':
        event_action = 'PULL_REQUEST'
    else:
        return None  # Ignore other PR actions

    return {
        'request_id': str(pr.get('id', '')),  # PR ID
        'author': pr.get('user', {}).get('login', 'Unknown'),
        'action': event_action,
        'from_branch': pr.get('head', {}).get('ref', ''),
        'to_branch': pr.get('base', {}).get('ref', ''),
        'timestamp': format_timestamp(pr.get('created_at', '')),
    }

def format_timestamp(iso_timestamp: str) -> str:
    """Format timestamp with ordinal suffix (1st, 2nd, 3rd, etc.)"""
    from src.utils.formatters import format_timestamp_with_ordinal
    from datetime import datetime

    if not iso_timestamp:
        return format_timestamp_with_ordinal(datetime.utcnow())

    try:
        # Parse ISO timestamp
        if iso_timestamp.endswith('Z'):
            dt = datetime.fromisoformat(iso_timestamp[:-1])
        else:
            dt = datetime.fromisoformat(iso_timestamp)

        return format_timestamp_with_ordinal(dt)
    except (ValueError, TypeError):
        # Fallback to current time if parsing fails
        return format_timestamp_with_ordinal(datetime.utcnow())
