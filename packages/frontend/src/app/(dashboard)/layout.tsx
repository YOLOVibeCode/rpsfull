'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MobileMenu } from '@/components/ui/MobileMenu';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 md:space-x-8">
              <Link href="/dashboard" className="text-lg md:text-xl font-bold text-primary">
                RPSFull
              </Link>
              {/* Desktop navigation */}
              <div className="hidden md:flex space-x-4">
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link href="/play" className="text-muted-foreground hover:text-foreground transition-colors">
                  Play
                </Link>
                <Link href="/games" className="text-muted-foreground hover:text-foreground transition-colors">
                  Games
                </Link>
                <Link href="/tournaments" className="text-muted-foreground hover:text-foreground transition-colors">
                  Tournaments
                </Link>
                <Link href="/game-editor" className="text-muted-foreground hover:text-foreground transition-colors">
                  Game Editor
                </Link>
                <Link href="/stats" className="text-muted-foreground hover:text-foreground transition-colors">
                  Statistics
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              {/* Desktop user info */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {user?.email}
                </span>
                {user?.isEmailVerified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800" title="Email verified">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hidden md:inline-flex"
              >
                Logout
              </Button>
              {/* Mobile menu */}
              <MobileMenu />
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {/* Email Verification Banner */}
        {user && !user.isEmailVerified && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-yellow-700">
                  <strong>Email not verified.</strong> Please verify your email address to access all features.
                </p>
                <div className="mt-2">
                  <Link href="/resend-verification" className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline">
                    Resend verification email
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

