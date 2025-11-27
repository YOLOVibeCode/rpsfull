'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X } from 'lucide-react';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/play', label: 'Play' },
    { href: '/games', label: 'Games' },
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/game-editor', label: 'Game Editor' },
    { href: '/stats', label: 'Statistics' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleMenu}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-card border-l shadow-xl z-50 md:hidden transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-xl font-bold text-primary">RPSFull</span>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-lg hover:bg-accent"
                    aria-label="Close menu"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Menu items */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={toggleMenu}
                        className="block px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* User info and logout */}
              <div className="p-4 border-t">
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Signed in as</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                    {user?.isEmailVerified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 ml-2" title="Email verified">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  {user && !user.isEmailVerified && (
                    <div className="mt-2">
                      <Link
                        href="/resend-verification"
                        onClick={toggleMenu}
                        className="text-xs text-yellow-600 hover:text-yellow-700 underline"
                      >
                        Verify email
                      </Link>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

