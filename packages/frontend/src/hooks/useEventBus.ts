/**
 * useEventBus Hook
 * 
 * React hook for subscribing to event bus events
 * Automatically cleans up subscriptions on unmount
 */

import { useEffect, useCallback } from 'react';
import { eventBus, EventType } from '@/lib/events/eventBus';

export function useEventBus(event: EventType, callback: (...args: any[]) => void) {
  useEffect(() => {
    const unsubscribe = eventBus.on(event, callback);
    return unsubscribe;
  }, [event, callback]);
}

export function useEventBusCallback() {
  return useCallback((event: EventType, ...args: any[]) => {
    eventBus.emit(event, ...args);
  }, []);
}








