/**
 * src/static/js/poller.js - API polling functionality
 */

class EventPoller {
  constructor(apiUrl = "/api/events", interval = 15000) {
    this.apiUrl = apiUrl;
    this.interval = interval;
    this.isPolling = false;
    this.lastEventCount = 0;
    this.onEventsUpdate = null;
    this.onError = null;
    this.pollTimer = null;
  }

  /**
   * Start polling for events
   */
  start() {
    if (this.isPolling) return;

    this.isPolling = true;
    this.poll(); // Initial poll
    this.scheduleNextPoll();
  }

  /**
   * Stop polling
   */
  stop() {
    this.isPolling = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Poll for new events
   */
  async poll() {
    try {
      const response = await fetch(this.apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const events = await response.json();

      // Check if we have new events
      const hasNewEvents = events.length !== this.lastEventCount;
      this.lastEventCount = events.length;

      // Notify listeners
      if (this.onEventsUpdate) {
        this.onEventsUpdate(events, hasNewEvents);
      }
    } catch (error) {
      console.error("Polling error:", error);

      if (this.onError) {
        this.onError(error);
      }
    }
  }

  /**
   * Schedule next poll
   */
  scheduleNextPoll() {
    if (!this.isPolling) return;

    this.pollTimer = setTimeout(() => {
      this.poll();
      this.scheduleNextPoll();
    }, this.interval);
  }

  /**
   * Force immediate poll
   */
  forcePoll() {
    if (this.isPolling) {
      this.poll();
    }
  }

  /**
   * Set polling interval
   * @param {number} interval - Interval in milliseconds
   */
  setInterval(interval) {
    this.interval = interval;
    if (this.isPolling) {
      this.stop();
      this.start();
    }
  }

  /**
   * Set event update callback
   * @param {Function} callback - Callback function(events, hasNewEvents)
   */
  setOnEventsUpdate(callback) {
    this.onEventsUpdate = callback;
  }

  /**
   * Set error callback
   * @param {Function} callback - Callback function(error)
   */
  setOnError(callback) {
    this.onError = callback;
  }

  /**
   * Get current polling status
   * @returns {boolean} True if polling
   */
  isActive() {
    return this.isPolling;
  }
}

// Create global poller instance
const eventPoller = new EventPoller();

// Export for module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = EventPoller;
}
