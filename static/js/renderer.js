// Event rendering utilities
class EventRenderer {
  constructor(containerElement) {
    this.container = containerElement;
    this.eventTemplate = null;
  }

  renderEvents(events) {
    if (!Array.isArray(events)) return;

    // Clear existing events
    this.clearEvents();

    // Render events in reverse chronological order (newest first)
    events
      .slice()
      .reverse()
      .forEach((event) => {
        const eventElement = this.createEventElement(event);
        this.container.appendChild(eventElement);
      });
  }

  addEvent(event) {
    const eventElement = this.createEventElement(event);
    // Add to top with animation
    eventElement.style.opacity = "0";
    this.container.insertBefore(eventElement, this.container.firstChild);

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

  clearEvents() {
    // Remove all event cards but keep empty state
    const eventCards = this.container.querySelectorAll(".event-card");
    eventCards.forEach((card) => card.remove());
  }

  removeEvent(requestId) {
    const eventElement = this.container.querySelector(
      `[data-request-id="${requestId}"]`,
    );
    if (eventElement) {
      eventElement.remove();
    }
  }

  updateEvent(event) {
    const existingElement = this.container.querySelector(
      `[data-request-id="${event.request_id}"]`,
    );
    if (existingElement) {
      const newElement = this.createEventElement(event);
      this.container.replaceChild(newElement, existingElement);
    }
  }
}

// Make available globally
window.EventRenderer = EventRenderer;
