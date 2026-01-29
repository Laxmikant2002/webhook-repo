// Polling utilities for real-time updates
class EventPoller {
  constructor(apiEndpoint, interval = 15000) {
    this.apiEndpoint = apiEndpoint;
    this.interval = interval;
    this.isPolling = false;
    this.timeoutId = null;
    this.lastPollTime = null;
    this.onEventsReceived = null;
    this.onError = null;
  }

  start() {
    if (this.isPolling) return;
    this.isPolling = true;
    this.poll();
  }

  stop() {
    this.isPolling = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  async poll() {
    if (!this.isPolling) return;

    try {
      const response = await fetch(this.apiEndpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.lastPollTime = new Date();

      if (this.onEventsReceived && data.success && Array.isArray(data.events)) {
        this.onEventsReceived(data.events);
      }
    } catch (error) {
      console.error("Polling error:", error);
      if (this.onError) {
        this.onError(error);
      }
    } finally {
      // Schedule next poll
      if (this.isPolling) {
        this.timeoutId = setTimeout(() => this.poll(), this.interval);
      }
    }
  }

  getLastPollTime() {
    return this.lastPollTime;
  }

  setInterval(interval) {
    this.interval = interval;
  }
}

// Make available globally
window.EventPoller = EventPoller;
