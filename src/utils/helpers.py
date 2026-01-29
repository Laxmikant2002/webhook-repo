"""
General utility helper functions.
"""
import re
from typing import Any, Dict, Optional
from urllib.parse import urlparse


def safe_get(data: Dict, key: str, default: Any = None) -> Any:
    """
    Safely get nested dictionary value.

    Args:
        data: Dictionary to search
        key: Dot-separated key path (e.g., 'user.name')
        default: Default value if key not found

    Returns:
        Value at key path or default
    """
    keys = key.split('.')
    current = data

    try:
        for k in keys:
            current = current[k]
        return current
    except (KeyError, TypeError):
        return default


def extract_branch_from_ref(ref: str) -> str:
    """
    Extract branch name from Git ref.

    Args:
        ref: Git reference (e.g., 'refs/heads/main')

    Returns:
        Branch name
    """
    if ref.startswith('refs/heads/'):
        return ref[11:]  # Remove 'refs/heads/'
    elif ref.startswith('refs/tags/'):
        return ref[10:]  # Remove 'refs/tags/'
    return ref


def is_valid_url(url: str) -> bool:
    """
    Check if string is a valid URL.

    Args:
        url: URL string to validate

    Returns:
        True if valid URL
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False


def sanitize_string(text: str, max_length: int = 100) -> str:
    """
    Sanitize string for safe display.

    Args:
        text: Text to sanitize
        max_length: Maximum length

    Returns:
        Sanitized string
    """
    if not text:
        return ''

    # Remove potentially dangerous characters
    text = re.sub(r'[<>]', '', text)

    # Truncate if too long
    if len(text) > max_length:
        text = text[:max_length - 3] + '...'

    return text.strip()


def generate_request_id(repo_name: str, event_id: str) -> str:
    """
    Generate unique request ID for event.

    Args:
        repo_name: Repository name
        event_id: Event identifier

    Returns:
        Unique request ID
    """
    return f"{repo_name}-{event_id}"


def deep_merge_dicts(base: Dict, update: Dict) -> Dict:
    """
    Deep merge two dictionaries.

    Args:
        base: Base dictionary
        update: Dictionary to merge in

    Returns:
        Merged dictionary
    """
    result = base.copy()

    for key, value in update.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dicts(result[key], value)
        else:
            result[key] = value

    return result
