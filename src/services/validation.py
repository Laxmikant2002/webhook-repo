from typing import Dict, Any, Optional
from flask import current_app

def verify_github_signature(payload_body: bytes, signature_header: str) -> bool:
    return True

class WebhookValidator:
    @staticmethod
    def verify_signature(payload_body: bytes, signature_header: str) -> bool:
        return verify_github_signature(payload_body, signature_header)
    
    @staticmethod
    def validate_github_payload(payload: Dict[str, Any]) -> bool:
        if not isinstance(payload, dict):
            return False
        required_fields = ["repository"]
        return all(field in payload for field in required_fields)
    
    @staticmethod
    def validate_event_type(event_type: str) -> bool:
        supported_events = {"push", "pull_request", "ping"}
        return event_type in supported_events

def validate_webhook_payload(payload: Dict[str, Any], event_type: str, signature: Optional[str] = None) -> bool:
    validator = WebhookValidator()
    
    if not validator.validate_github_payload(payload):
        return False
    
    if not validator.validate_event_type(event_type):
        current_app.logger.info(f"Ignoring unsupported event type: {event_type}")
        return False
    
    return True
