from flask import Blueprint, request, jsonify, current_app
from src.services.event_processor import process_webhook_payload
from src.services.validation import validate_webhook_payload
from src.models.repository import save_event

webhook_bp = Blueprint('webhook', __name__)

@webhook_bp.route('/webhook', methods=['POST'])
def github_webhook():
    try:
        payload = request.get_json()
        event_type = request.headers.get('X-GitHub-Event', '')
        signature = request.headers.get('X-Hub-Signature-256', '')

        if not validate_webhook_payload(payload, event_type, signature):
            current_app.logger.warning(f'Invalid webhook payload or event type: {event_type}')
            return jsonify({'error': 'Invalid payload or event type'}), 400

        event = process_webhook_payload(event_type, payload)

        if not event:
            current_app.logger.info(f'Ignored or invalid event: {event_type}')
            return jsonify({'status': 'ignored'}), 200

        was_saved = save_event(event)

        if was_saved:
            current_app.logger.info(f'Event saved: {event.action.value} by {event.author}')
            status_msg = 'created'
        else:
            current_app.logger.info(f'Event already exists: {event.action.value} by {event.author}')
            status_msg = 'exists'

        return jsonify({
            'status': status_msg,
            'request_id': event.request_id,
            'action': event.action.value
        }), 200

    except Exception as e:
        current_app.logger.error(f'Webhook processing error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500
