'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { IJoinTournamentResultDto } from '@rpsfull-platform/contracts';

/**
 * Confirm Tournament Registration Page
 * 
 * Handles magic link confirmation for tournament registration
 * Following ISP: Single responsibility - magic link confirmation
 */
export default function ConfirmTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  useEffect(() => {
    const confirm = async () => {
      try {
        const result = await apiClient.post<IJoinTournamentResultDto>(
          `/tournaments/confirm-registration/${token}`
        );

        // Store auth token for auto-login
        if (result.accessToken) {
          localStorage.setItem('accessToken', result.accessToken);
        }

        setTournamentId(result.tournamentId);
        setStatus('success');

        // Redirect to tournament page after 2 seconds
        setTimeout(() => {
          router.push(`/tournaments/${result.tournamentId}`);
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'Invalid or expired confirmation link');
      }
    };

    if (token) {
      confirm();
    }
  }, [token, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Confirming Registration...</h1>
            <p className="text-gray-600">Please wait while we process your registration.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Registration Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              You've successfully registered for the tournament. Redirecting you now...
            </p>
            {tournamentId && (
              <a
                href={`/tournaments/${tournamentId}`}
                className="text-primary-600 hover:underline"
              >
                Go to tournament →
              </a>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Registration Failed</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </main>
  );
}

