/**
 * src/static/js/app.js - Main application logic
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the application
  initApp();
});

/**
 * Initialize the application
 */
function initApp() {
  const eventsContainer = document.getElementById("events-container");
  const statusIndicator = document.getElementById("status-indicator");

  if (!eventsContainer) {
    console.error("Events container not found");
    return;
  }

  // Show initial loading state
  showLoading(eventsContainer);

  // Setup poller
  eventPoller.setOnEventsUpdate((events, hasNewEvents) => {
    renderEvents(events, eventsContainer);

    if (hasNewEvents && events.length > 0) {
      highlightNewEvents(eventsContainer);
      updateStatus("New events received", "success");
    }
  });

  eventPoller.setOnError((error) => {
    console.error("Polling error:", error);
    updateStatus("Connection error - retrying...", "error");

    // Show error in UI
    showError(eventsContainer, "Failed to load events. Retrying...");
  });

  // Start polling
  eventPoller.start();

  // Update status
  updateStatus("Connected - monitoring for events", "success");

  // Setup visibility change handler for efficient polling
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Pause polling when tab is not visible
      eventPoller.stop();
    } else {
      // Resume polling when tab becomes visible
      eventPoller.start();
    }
  });

  // Setup manual refresh button if exists
  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      showLoading(eventsContainer);
      eventPoller.forcePoll();
    });
  }

  // Setup keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + R for manual refresh
    if ((e.ctrlKey || e.metaKey) && e.key === "r") {
      e.preventDefault();
      showLoading(eventsContainer);
      eventPoller.forcePoll();
    }
  });

  // Log initialization
  console.log("GitHub Webhook Monitor initialized");
}

/**
 * Update status indicator
 * @param {string} message - Status message
 * @param {string} type - Status type (success, error, info)
 */
function updateStatus(message, type = "info") {
  const statusIndicator = document.getElementById("status-indicator");
  if (!statusIndicator) return;

  statusIndicator.textContent = message;
  statusIndicator.className = `status-${type}`;

  // Auto-hide success messages after 5 seconds
  if (type === "success") {
    setTimeout(() => {
      statusIndicator.textContent = "";
      statusIndicator.className = "";
    }, 5000);
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
