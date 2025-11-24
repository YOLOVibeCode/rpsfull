'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { MobileMenu } from '@/components/ui/MobileMenu';

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 md:space-x-8">
              <Link href="/dashboard" className="text-lg md:text-xl font-bold text-primary-700">
                RPSFull
              </Link>
              {/* Desktop navigation */}
              <div className="hidden md:flex space-x-4">
                <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/play" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Play
                </Link>
                <Link href="/tournaments" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Tournaments
                </Link>
                <Link href="/stats" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Statistics
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Desktop user info */}
              <span className="hidden md:block text-sm text-gray-700 truncate max-w-[200px]">
                {user?.email}
              </span>
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
        {children}
      </main>
    </div>
  );
}

