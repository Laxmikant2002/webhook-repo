// Main application JavaScript
class ActivityDashboard {
  constructor(config) {
    this.pollingInterval = config.pollingInterval || 15000;
    this.apiEndpoint = config.apiEndpoint || "/api/events";
    this.eventsContainer = document.getElementById("events-container");
    this.emptyState = document.getElementById("empty-state");
    this.lastUpdateElement = document.getElementById("last-update");
    this.isPolling = false;
    this.currentEvents = new Map(); // Using Map to prevent duplicates by request_id
    this.pollTimeout = null;
  }

  async fetchEvents() {
    try {
      const response = await fetch(this.apiEndpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.events)) {
        this.processEvents(data.events);
        this.updateLastPollTime();
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      this.showError("Failed to fetch updates. Retrying...");
    } finally {
      // Schedule next poll using recursive setTimeout for better timing control
      if (this.isPolling) {
        this.pollTimeout = setTimeout(
          () => this.fetchEvents(),
          this.pollingInterval,
        );
      }
    }
  }

  processEvents(events) {
    if (events.length === 0) {
      this.showEmptyState();
      return;
    }

    this.hideEmptyState();

    // Process events in reverse chronological order (newest first)
    events.reverse().forEach((event) => {
      // Use request_id as unique key to prevent duplicates
      if (!this.currentEvents.has(event.request_id)) {
        this.currentEvents.set(event.request_id, event);
        this.addEventToUI(event);
      }
    });

    // Limit displayed events to 50
    this.trimEvents(50);
  }

  addEventToUI(event) {
    const eventElement = this.createEventElement(event);

    // Add with fade-in animation
    eventElement.style.opacity = "0";
    this.eventsContainer.insertBefore(
      eventElement,
      this.eventsContainer.firstChild,
    );

    // Trigger animation
    setTimeout(() => {
      eventElement.style.transition = "opacity 0.3s ease";
      eventElement.style.opacity = "1";
    }, 10);
  }

  createEventElement(event) {
    const eventCard = document.createElement("div");
    eventCard.className = `event-card ${event.action.toLowerCase()}`;
    eventCard.dataset.requestId = event.request_id;

    const icon = this.getEventIcon(event.action);
    const message = this.formatEventMessage(event);

    eventCard.innerHTML = `
            <div class="event-icon">${icon}</div>
            <div class="event-content">
                <div class="event-message">${message}</div>
                <div class="event-meta">
                    <span class="event-timestamp">${event.timestamp}</span>
                    <span class="event-type">${event.action.replace("_", " ")}</span>
                </div>
            </div>
        `;

    return eventCard;
  }

  getEventIcon(action) {
    const icons = {
      PUSH: '<i class="fas fa-code-commit"></i>',
      PULL_REQUEST: '<i class="fas fa-code-pull-request"></i>',
      MERGE: '<i class="fas fa-code-merge"></i>',
    };
    return icons[action] || '<i class="fas fa-code"></i>';
  }

  formatEventMessage(event) {
    const author = `<span class="event-author">${event.author}</span>`;
    const fromBranch = event.from_branch
      ? `<span class="branch from-branch">${event.from_branch}</span>`
      : "";
    const toBranch = `<span class="branch to-branch">${event.to_branch}</span>`;

    switch (event.action) {
      case "PUSH":
        return `${author} pushed to ${toBranch}`;
      case "PULL_REQUEST":
        return `${author} submitted a pull request from ${fromBranch} to ${toBranch}`;
      case "MERGE":
        return `${author} merged branch ${fromBranch} to ${toBranch}`;
      default:
        return `${author} performed ${event.action.toLowerCase()}`;
    }
  }

  showEmptyState() {
    this.emptyState.style.display = "block";
  }

  hideEmptyState() {
    this.emptyState.style.display = "none";
  }

  showError(message) {
    // Show error toast or update status
    console.error("Dashboard error:", message);
  }

  updateLastPollTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    this.lastUpdateElement.textContent = timeString;
  }

  trimEvents(maxCount) {
    if (this.currentEvents.size > maxCount) {
      const excess = this.currentEvents.size - maxCount;
      const keysToRemove = Array.from(this.currentEvents.keys()).slice(
        0,
        excess,
      );

      keysToRemove.forEach((key) => {
        this.currentEvents.delete(key);
        const element = this.eventsContainer.querySelector(
          `[data-request-id="${key}"]`,
        );
        if (element) {
          element.remove();
        }
      });
    }
  }

  start() {
    this.isPolling = true;
    this.fetchEvents(); // Initial fetch
  }

  stop() {
    this.isPolling = false;
    if (this.pollTimeout) {
      clearTimeout(this.pollTimeout);
    }
  }
}

// Make available globally
window.ActivityDashboard = ActivityDashboard;
