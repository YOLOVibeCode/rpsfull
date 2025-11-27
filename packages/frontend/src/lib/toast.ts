/**
 * Toast Utility
 * 
 * Centralized toast notification system using Sonner
 * Integrates with event bus for decoupled notifications
 */

import { toast as sonnerToast } from 'sonner';
import { eventBus, Events } from './events/eventBus';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
    eventBus.emit(Events.TOAST_SHOW, { type: 'success', message, description });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
    eventBus.emit(Events.TOAST_SHOW, { type: 'error', message, description });
    eventBus.emit(Events.ERROR_OCCURRED, { message, description });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
    eventBus.emit(Events.TOAST_SHOW, { type: 'info', message, description });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
    eventBus.emit(Events.TOAST_SHOW, { type: 'warning', message, description });
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};





