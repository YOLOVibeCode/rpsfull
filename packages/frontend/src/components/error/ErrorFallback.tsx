'use client';

import { FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-destructive/50 rounded-lg p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          We encountered an unexpected error. Please try refreshing the page or returning to the dashboard.
        </p>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-muted-foreground mb-2">
              Error details (development only)
            </summary>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
              {error.toString()}
              {error.stack}
            </pre>
          </details>
        )}
        <div className="flex gap-3">
          <Button onClick={resetErrorBoundary} variant="default" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => {
              resetErrorBoundary();
              router.push('/dashboard');
            }}
            variant="outline"
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}


