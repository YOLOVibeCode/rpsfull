'use client';

import { Skeleton } from './skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className, size = 'default' }: { className?: string; size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        {message && <p className="text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

export function TournamentCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center gap-4 pt-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

export function PlayerCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}








