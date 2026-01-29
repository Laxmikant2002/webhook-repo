# Security utilities - HMAC verification
import hmac
import hashlib
from flask import current_app

def verify_github_signature(payload_body: bytes, signature_header: str) -> bool:
    """Verify GitHub webhook signature using HMAC-SHA256"""
    if not signature_header:
        return False
    
    webhook_secret = current_app.config.get('WEBHOOK_SECRET', '').encode()
    if not webhook_secret:
        # If no secret is configured, skip verification (for development)
        return True
    
    # Compute HMAC
    hash_object = hmac.new(
        webhook_secret,
        msg=payload_body,
        digestmod=hashlib.sha256
    )
    expected_signature = "sha256=" + hash_object.hexdigest()
    
    # Compare signatures using constant-time comparison
    return hmac.compare_digest(expected_signature, signature_header)

def extract_signature_from_header(header_value: str) -> str:
    """Extract signature from X-Hub-Signature-256 header"""
    if not header_value:
        return ''
    
    # Header format: sha256=signature
    parts = header_value.split('=')
    return parts[1] if len(parts) == 2 else ''
