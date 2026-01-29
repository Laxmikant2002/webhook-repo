/**
 * src/static/js/utils.js - Utility functions for the frontend
 */

/**
 * Format relative time (e.g., "2 minutes ago")
 * @param {Date} date - Date to format
 * @returns {string} Formatted relative time
 */
function formatRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Show loading spinner
 * @param {HTMLElement} container - Container element
 */
function showLoading(container) {
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      Loading events...
    </div>
  `;
}

/**
 * Show error message
 * @param {HTMLElement} container - Container element
 * @param {string} message - Error message
 */
function showError(container, message) {
  container.innerHTML = `
    <div class="error-message">
      <strong>Error:</strong> ${message}
    </div>
  `;
}

/**
 * Show empty state
 * @param {HTMLElement} container - Container element
 */
function showEmptyState(container) {
  container.innerHTML = `
    <div class="empty-state">
      <h3>No events yet</h3>
      <p>Events will appear here when GitHub webhooks are received.</p>
    </div>
  `;
}

/**
 * Sanitize HTML content
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get user initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format event action for display
 * @param {string} action - Event action
 * @returns {string} Formatted action
 */
function formatEventAction(action) {
  const actionMap = {
    PUSH: "pushed to",
    PULL_REQUEST: "opened pull request to",
    MERGE: "merged branch to",
  };
  return actionMap[action] || action.toLowerCase();
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 * @param {HTMLElement} element - Element to scroll to
 */
function smoothScrollTo(element) {
  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// Export functions for module use (if using modules)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    formatRelativeTime,
    debounce,
    showLoading,
    showError,
    showEmptyState,
    sanitizeHtml,
    getInitials,
    formatEventAction,
    isInViewport,
    smoothScrollTo,
  };
}
