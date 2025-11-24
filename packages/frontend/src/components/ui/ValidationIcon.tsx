'use client';

import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ValidationStatus = 'idle' | 'checking' | 'valid' | 'invalid';

interface ValidationIconProps {
  status: ValidationStatus;
  message?: string;
  isLoading?: boolean;
  value?: string;
}

export function ValidationIcon({
  status,
  message,
  isLoading,
  value,
}: ValidationIconProps) {
  // Don't show icon if no value entered
  if (!value || value.length === 0) {
    return null;
  }

  // Show loading spinner if checking
  if (status === 'checking' || isLoading) {
    return (
      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
    );
  }

  // Show checkmark if valid
  if (status === 'valid') {
    return (
      <CheckCircle2 className="w-5 h-5 text-green-500" title={message || 'Available'} />
    );
  }

  // Show X if invalid
  if (status === 'invalid') {
    return (
      <XCircle className="w-5 h-5 text-red-500" title={message || 'Not available'} />
    );
  }

  return null;
}
