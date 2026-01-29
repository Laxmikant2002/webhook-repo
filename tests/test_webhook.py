import pytest
import json

def test_ping_event(client):
    """Test GitHub webhook ping event"""
    response = client.post('/webhook',
        json={
            'zen': 'Testing',
            'repository': {'name': 'test-repo', 'full_name': 'test/test-repo'}
        },
        headers={'X-GitHub-Event': 'ping'}
    )
    assert response.status_code == 200
    assert response.json.get('status') == 'ignored'

def test_push_event(client):
    """Test push event processing"""
    push_payload = {
        "ref": "refs/heads/main",
        "after": "abc123def456",
        "pusher": {"name": "TestUser"},
        "head_commit": {"timestamp": "2021-04-01T21:30:00Z"},
        "repository": {"name": "test-repo", "full_name": "test/test-repo"}
    }

    response = client.post('/webhook',
        json=push_payload,
        headers={'X-GitHub-Event': 'push'}
    )

    assert response.status_code == 200
    assert response.json.get('status') in ['created', 'exists']
    assert response.json.get('action') == 'PUSH'

def test_get_events(client):
    """Test API endpoint for getting events"""
    response = client.get('/api/events')
    assert response.status_code == 200
    assert 'success' in response.json
    assert 'events' in response.json
    assert isinstance(response.json['events'], list)