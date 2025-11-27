/**
 * Event Bus
 * 
 * Simple event bus for decoupled component communication
 * Follows observer pattern for loose coupling
 */

type EventCallback = (...args: any[]) => void;
type EventMap = Record<string, EventCallback[]>;

class EventBus {
  private events: EventMap = {};

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  /**
   * Emit an event
   */
  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;

    this.events[event].forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  /**
   * Subscribe to an event once
   */
  once(event: string, callback: EventCallback): void {
    const wrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }

  /**
   * Get all event names
   */
  getEventNames(): string[] {
    return Object.keys(this.events);
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Event type definitions for type safety
export const Events = {
  // Match events
  MATCH_CREATED: 'match:created',
  MATCH_UPDATED: 'match:updated',
  MATCH_COMPLETED: 'match:completed',
  ROUND_PLAYED: 'round:played',

  // Tournament events
  TOURNAMENT_CREATED: 'tournament:created',
  TOURNAMENT_UPDATED: 'tournament:updated',
  TOURNAMENT_REGISTERED: 'tournament:registered',
  BRACKET_UPDATED: 'bracket:updated',

  // Player events
  PLAYER_STATS_UPDATED: 'player:stats:updated',
  PLAYER_LEVEL_UP: 'player:level:up',

  // UI events
  TOAST_SHOW: 'toast:show',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',
  NAVIGATE: 'navigate',

  // Error events
  ERROR_OCCURRED: 'error:occurred',
  NETWORK_ERROR: 'error:network',
} as const;

export type EventType = typeof Events[keyof typeof Events];





