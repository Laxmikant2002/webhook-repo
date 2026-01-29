"""
Validation service for webhook payloads and data.
"""
from typing import Dict, Any, Optional
from flask import current_app
from src.utils.security import verify_github_signature


class WebhookValidator:
    """Validator for GitHub webhook payloads."""
    
    @staticmethod
    def verify_signature(payload_body: bytes, signature_header: str) -> bool:
        """
        Verify GitHub webhook signature using HMAC-SHA256.
        
        Args:
            payload_body: Raw request body bytes
            signature_header: X-Hub-Signature-256 header value
            
        Returns:
            True if signature is valid, False otherwise
        """
        return verify_github_signature(payload_body, signature_header)
    
    @staticmethod
    def validate_github_payload(payload: Dict[str, Any]) -> bool:
        """
        Validate that the payload contains required GitHub webhook fields.
        
        Args:
            payload: Parsed JSON payload
            
        Returns:
            True if payload appears valid
        """
        if not isinstance(payload, dict):
            return False
        
        # Basic validation - payload should have some common GitHub fields
        required_fields = ['repository']
        return all(field in payload for field in required_fields)
    
    @staticmethod
    def validate_event_type(event_type: str) -> bool:
        """
        Validate that the event type is supported.
        
        Args:
            event_type: GitHub event type
            
        Returns:
            True if event type is supported
        """
        supported_events = {'push', 'pull_request', 'ping'}
        return event_type in supported_events


def validate_webhook_payload(payload: Dict[str, Any], event_type: str, signature: Optional[str] = None) -> bool:
    """
    Comprehensive validation of webhook payload.
    
    Args:
        payload: Webhook payload
        event_type: GitHub event type
        signature: Signature header (optional)
        
    Returns:
        True if all validations pass
    """
    validator = WebhookValidator()
    
    # Validate payload structure
    if not validator.validate_github_payload(payload):
        current_app.logger.warning('Invalid payload structure')
        return False
    
    # Validate event type
    if not validator.validate_event_type(event_type):
        current_app.logger.info(f'Ignoring unsupported event type: {event_type}')
        return False
    
    return True