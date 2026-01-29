# src/routes/api.py - API endpoints for the dashboard
from flask import Blueprint, jsonify, request, current_app
from src.models.repository import get_recent_events
from src.utils.constants import DEFAULT_EVENTS_LIMIT

api_bp = Blueprint('api', __name__)

@api_bp.route('/events', methods=['GET'])
def get_events():
    """
    Get recent events for the dashboard.

    Returns the latest events sorted by creation time (newest first).
    Limits results to prevent overwhelming the UI.
    """
    try:
        limit = int(request.args.get('limit', DEFAULT_EVENTS_LIMIT))
        limit = min(limit, 100)  # Cap at 100 events

        events = get_recent_events(limit)

        if not events:
            return jsonify({'success': True, 'events': []}), 200

        current_app.logger.debug(f'Returning {len(events)} events')
        return jsonify({'success': True, 'events': events}), 200

    except ValueError as e:
        current_app.logger.warning(f'Invalid limit parameter: {e}')
        return jsonify({'error': 'Invalid limit parameter'}), 400
    except Exception as e:
        current_app.logger.error(f'API error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@api_bp.route('/events/stats', methods=['GET'])
def get_event_stats():
    """
    Get basic statistics about events.

    Returns count of total events and breakdown by action type.
    """
    try:
        # This is a simplified version - in a real app you'd aggregate in MongoDB
        all_events = get_recent_events(1000)  # Get recent events for stats

        stats = {
            'total': len(all_events),
            'by_action': {}
        }

        for event in all_events:
            action = event.get('action', 'UNKNOWN')
            stats['by_action'][action] = stats['by_action'].get(action, 0) + 1

        return jsonify(stats), 200

    except Exception as e:
        current_app.logger.error(f'Stats API error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
