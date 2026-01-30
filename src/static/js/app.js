console.log('GitHub Activity Monitor loading...');

class ActivityDashboard {
    constructor(config = {}) {
        this.pollingInterval = config.pollingInterval || 15000;
        this.apiEndpoint = config.apiEndpoint || '/api/events';
        this.eventsContainer = document.getElementById('events-container');
        this.emptyState = document.getElementById('empty-state');
        this.lastUpdateElement = document.getElementById('last-update');
        this.isPolling = false;
        this.pollTimeout = null;
        this.lastEventCount = 0;
    }

    async fetchEvents() {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.events)) {
                this.renderEvents(data.events);
                this.updateLastPollTime();
                this.hideError();
                
                if (data.events.length !== this.lastEventCount) {
                    this.lastEventCount = data.events.length;
                    if (data.events.length > 0) {
                        this.highlightNewEvents();
                    }
                }
            } else {
                throw new Error('Invalid response');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('Failed to load events');
        } finally {
            if (this.isPolling) {
                this.pollTimeout = setTimeout(() => this.fetchEvents(), this.pollingInterval);
            }
        }
    }

    renderEvents(events) {
        if (!this.eventsContainer) return;
        
        if (events.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        const eventsHtml = events.map(event => this.createEventCard(event)).join('');
        this.eventsContainer.innerHTML = eventsHtml;
    }

    createEventCard(event) {
        const eventClass = `event-${event.action.toLowerCase().replace('_', '-')}`;
        const icon = this.getEventIcon(event.action);
        const initials = this.getInitials(event.author);
        const message = this.formatEventMessage(event);
        const actionBadge = event.action.replace('_', ' ');
        
        return `
            <div class="event-card ${eventClass}">
                <div class="event-avatar">${initials}</div>
                <div class="event-content">
                    <div class="event-author">${this.sanitizeHtml(event.author)}</div>
                    <div class="event-action">
                        <span class="event-icon">${icon}</span>
                        ${message}
                        <span class="badge badge-${event.action.toLowerCase()}">${actionBadge}</span>
                    </div>
                    <div class="event-timestamp">${event.timestamp}</div>
                </div>
            </div>
        `;
    }

    formatEventMessage(event) {
        const toBranch = `<span class="branch">${this.sanitizeHtml(event.to_branch)}</span>`;
        const fromBranch = event.from_branch ? 
            `<span class="branch">${this.sanitizeHtml(event.from_branch)}</span>` : '';
        
        switch(event.action) {
            case 'PUSH':
                return `pushed to ${toBranch}`;
            case 'PULL_REQUEST':
                return `submitted PR from ${fromBranch} to ${toBranch}`;
            case 'MERGE':
                return `merged ${fromBranch} to ${toBranch}`;
            default:
                return `performed ${event.action.toLowerCase()}`;
        }
    }

    getEventIcon(action) {
        const icons = { 'PUSH': '📤', 'PULL_REQUEST': '🔄', 'MERGE': '✅' };
        return icons[action] || '📝';
    }

    getInitials(name) {
        if (!name) return '??';
        return name.split(/[\s_-]/)
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    sanitizeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    showEmptyState() {
        if (this.emptyState) this.emptyState.style.display = 'block';
    }

    hideEmptyState() {
        if (this.emptyState) this.emptyState.style.display = 'none';
    }

    showError(message) {
        let errorElement = document.getElementById('error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'error-message';
            errorElement.className = 'error-message';
            if (this.eventsContainer) {
                this.eventsContainer.parentNode.insertBefore(errorElement, this.eventsContainer);
            }
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    hideError() {
        const errorElement = document.getElementById('error-message');
        if (errorElement) errorElement.style.display = 'none';
    }

    updateLastPollTime() {
        if (this.lastUpdateElement) {
            const now = new Date();
            this.lastUpdateElement.textContent = now.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }

    highlightNewEvents() {
        const cards = this.eventsContainer.querySelectorAll('.event-card');
        cards.forEach((card, index) => {
            card.style.animation = `fadeInUp 0.3s ease ${index * 0.1}s forwards`;
        });
    }

    start() {
        this.isPolling = true;
        this.fetchEvents();
    }

    stop() {
        this.isPolling = false;
        if (this.pollTimeout) {
            clearTimeout(this.pollTimeout);
            this.pollTimeout = null;
        }
    }
}

window.ActivityDashboard = ActivityDashboard;
  }
}

/**
 * Handle application errors
 * @param {Error} error - Error object
 */
function handleAppError(error) {
  console.error("Application error:", error);
  updateStatus("Application error occurred", "error");

  // Show error overlay or message
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.innerHTML = `
    <h3>Application Error</h3>
    <p>${error.message}</p>
    <button onclick="location.reload()">Reload Page</button>
  `;

  document.body.appendChild(errorDiv);
}

// Global error handlers
window.addEventListener("error", (e) => {
  handleAppError(e.error);
});

window.addEventListener("unhandledrejection", (e) => {
  handleAppError(new Error(`Unhandled promise rejection: ${e.reason}`));
});

// Export for debugging
window.app = {
  poller: eventPoller,
  refresh: () => eventPoller.forcePoll(),
  stop: () => eventPoller.stop(),
  start: () => eventPoller.start(),
};
