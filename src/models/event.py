"""
Event model and schema definition
"""
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import Optional
from enum import Enum


class EventAction(str, Enum):
    PUSH = "PUSH"
    PULL_REQUEST = "PULL_REQUEST"
    MERGE = "MERGE"


@dataclass
class GitHubEvent:
    """GitHub event data model"""
    request_id: str  # Commit SHA or PR ID
    author: str
    action: EventAction
    from_branch: Optional[str]
    to_branch: str
    timestamp: str  # Formatted: "1st April 2021 - 9:30 PM UTC"
    created_at: datetime = None

    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()

    def to_dict(self):
        """Convert to dictionary for MongoDB"""
        data = asdict(self)
        data['action'] = self.action.value
        return data

    @classmethod
    def from_github_payload(cls, event_type: str, payload: dict):
        """Factory method to create event from GitHub payload"""
        from src.services.github_parser import parse_github_event
        parsed_data = parse_github_event(event_type, payload)
        if parsed_data:
            return cls(**parsed_data)
        return None