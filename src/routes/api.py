from flask import Blueprint, jsonify, current_app
from src.models.repository import get_recent_events

api_bp = Blueprint('api', __name__)

@api_bp.route('/events')
def get_events():
    try:
        limit = current_app.config.get('EVENTS_LIMIT', 50)
        events = get_recent_events(limit)
        
        return jsonify({
            'success': True,
            'events': events,
            'count': len(events)
        })
    
    except Exception as e:
        current_app.logger.error(f'API error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve events'
        }), 500
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
