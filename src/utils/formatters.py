# Timestamp and data formatting
from datetime import datetime

def format_timestamp_with_ordinal(iso_timestamp: str) -> str:
    """
    Format timestamp with ordinal suffix according to spec:
    "1st April 2021 - 9:30 PM UTC"
    """
    if not iso_timestamp:
        return ''
    
    # Parse ISO timestamp
    try:
        # Handle Z suffix for UTC
        if iso_timestamp.endswith('Z'):
            iso_timestamp = iso_timestamp[:-1] + '+00:00'
        
        dt = datetime.fromisoformat(iso_timestamp)
    except ValueError:
        # If parsing fails, return current time
        dt = datetime.utcnow()
    
    # Get day with ordinal suffix
    day = dt.day
    suffix = get_ordinal_suffix(day)
    
    # Format: "1st April 2021 - 9:30 PM UTC"
    # Note: %-d doesn't work on Windows, using {day} instead
    formatted_date = dt.strftime(f"{day}{suffix} %B %Y - %I:%M %p UTC")
    
    # Remove leading zero from hour (12-hour format)
    formatted_date = formatted_date.replace(' 0', ' ')
    
    return formatted_date

def get_ordinal_suffix(day: int) -> str:
    """Get ordinal suffix for day number (st, nd, rd, th)"""
    if 11 <= day <= 13:
        return 'th'
    
    last_digit = day % 10
    suffixes = {1: 'st', 2: 'nd', 3: 'rd'}
    return suffixes.get(last_digit, 'th')

def format_branch_name(branch_ref: str) -> str:
    """Extract branch name from ref (refs/heads/main -> main)"""
    if not branch_ref:
        return ''
    
    if branch_ref.startswith('refs/heads/'):
        return branch_ref[11:]  # Remove 'refs/heads/'
    
    return branch_ref
