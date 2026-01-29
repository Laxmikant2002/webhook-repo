/**
 * src/static/js/renderer.js - Event rendering functionality
 */

/**
 * Render events to container
 * @param {Array} events - Array of event objects
 * @param {HTMLElement} container - Container element
 */
function renderEvents(events, container) {
  if (!events || events.length === 0) {
    showEmptyState(container);
    return;
  }

  const eventsHtml = events.map((event) => renderEventCard(event)).join("");
  container.innerHTML = eventsHtml;
}

/**
 * Render single event card
 * @param {Object} event - Event object
 * @returns {string} HTML string
 */
function renderEventCard(event) {
  const eventClass = `event-${event.action.toLowerCase()}`;
  const iconClass = getEventIcon(event.action);
  const initials = getInitials(event.author);
  const actionText = formatEventAction(event.action);
  const timestamp = formatTimestamp(event.timestamp);

  return `
    <div class="event-card ${eventClass}" data-event-id="${event.request_id}">
      <div class="event-header">
        <div class="event-avatar">${initials}</div>
        <div class="event-content">
          <div class="event-author">${sanitizeHtml(event.author)}</div>
          <div class="event-action">
            <span class="event-icon">${iconClass}</span>
            ${actionText}
            ${renderBranches(event)}
            <span class="badge badge-${event.action.toLowerCase()}">${event.action}</span>
          </div>
          <div class="event-timestamp">${timestamp}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render branch information
 * @param {Object} event - Event object
 * @returns {string} HTML string
 */
function renderBranches(event) {
  let branches = "";

  if (event.to_branch) {
    branches += `<span class="branch">${sanitizeHtml(event.to_branch)}</span>`;
  }

  if (event.from_branch && event.action !== "PUSH") {
    branches += ` from <span class="branch">${sanitizeHtml(event.from_branch)}</span>`;
  }

  return branches;
}

/**
 * Get icon for event type
 * @param {string} action - Event action
 * @returns {string} Icon HTML
 */
function getEventIcon(action) {
  const icons = {
    PUSH: "📤",
    PULL_REQUEST: "🔄",
    MERGE: "✅",
  };
  return icons[action] || "📝";
}

/**
 * Format timestamp for display
 * @param {string} timestamp - Timestamp string
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    return formatRelativeTime(date) + " • " + timestamp;
  } catch (e) {
    return timestamp;
  }
}

/**
 * Update events with animation
 * @param {Array} newEvents - New events array
 * @param {HTMLElement} container - Container element
 */
function updateEventsAnimated(newEvents, container) {
  const existingCards = container.querySelectorAll(".event-card");
  const existingIds = new Set(
    Array.from(existingCards).map((card) => card.dataset.eventId),
  );

  // Find new events
  const newEventCards = newEvents
    .filter((event) => !existingIds.has(event.request_id))
    .map((event) => {
      const cardHtml = renderEventCard(event);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = cardHtml;
      const card = tempDiv.firstElementChild;
      card.style.opacity = "0";
      card.style.transform = "translateY(-20px)";
      return card;
    });

  // Add new cards with animation
  newEventCards.forEach((card) => {
    container.insertBefore(card, container.firstChild);

    // Trigger animation
    requestAnimationFrame(() => {
      card.style.transition = "all 0.3s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    });
  });

  // Update existing cards if needed
  if (newEvents.length > existingCards.length) {
    // Re-render all if count changed significantly
    renderEvents(newEvents, container);
  }
}

/**
 * Highlight new events
 * @param {HTMLElement} container - Container element
 */
function highlightNewEvents(container) {
  const cards = container.querySelectorAll(".event-card");
  cards.forEach((card, index) => {
    if (index < 3) {
      // Highlight first 3 (newest)
      card.classList.add("new-event");
      setTimeout(() => {
        card.classList.remove("new-event");
      }, 3000);
    }
  });
}

// Export functions
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    renderEvents,
    renderEventCard,
    updateEventsAnimated,
    highlightNewEvents,
  };
}
