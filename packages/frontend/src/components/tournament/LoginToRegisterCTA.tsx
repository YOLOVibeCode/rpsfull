'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginToRegisterCTAProps {
  tournamentId: string;
}

/**
 * LoginToRegisterCTA Component
 * 
 * Prompts user to login or signup to register for tournament
 * Following ISP: Single responsibility - registration CTA
 */
export function LoginToRegisterCTA({ tournamentId }: LoginToRegisterCTAProps) {
  const router = useRouter();

  const handleLogin = () => {
    // Redirect to login with return URL
    router.push(`/login?returnTo=/tournaments/${tournamentId}`);
  };

  const handleSignup = () => {
    // Redirect to register with return URL
    router.push(`/register?returnTo=/tournaments/${tournamentId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Join This Tournament</h3>
      <p className="text-gray-600 mb-6">
        Sign in or create an account to register for this tournament and compete for the championship!
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleLogin}
          variant="primary"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Button>
        
        <Button
          onClick={handleSignup}
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Create Account
        </Button>
      </div>
    </div>
  );
}

