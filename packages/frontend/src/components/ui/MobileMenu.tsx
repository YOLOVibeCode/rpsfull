'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/play', label: 'Play' },
    { href: '/tournaments', label: 'Tournaments' },
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
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 md:hidden transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-xl font-bold text-primary-700">RPSFull</span>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Menu items */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={toggleMenu}
                        className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
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
                  <p className="text-sm text-gray-600 mb-1">Signed in as</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
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

