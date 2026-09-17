'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { toast } from '@/lib/toast';

type VerificationStatus = 'loading' | 'success' | 'error' | 'idle';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing. Please check your email link.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      setStatus('loading');
      const data = await apiClient.get<{
        user: {
          id: string;
          email: string;
          isEmailVerified: boolean;
        };
        accessToken?: string;
        refreshToken?: string;
      }>(`/auth/verify/email?token=${encodeURIComponent(token)}`);

      // If tokens are provided, store them and log user in
      if (data.accessToken && data.refreshToken) {
        apiClient.setToken(data.accessToken);
        apiClient.setRefreshToken(data.refreshToken);
        toast.success('Email verified successfully!', 'You have been logged in.');
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        toast.success('Email verified successfully!', 'You can now log in.');
        setStatus('success');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error: any) {
      setStatus('error');
      const message = error?.response?.data?.error?.message || 
                     error?.message || 
                     'Email verification failed. The link may have expired or is invalid.';
      setErrorMessage(message);
      toast.error('Verification failed', message);
    }
  };

  const handleResend = async () => {
    // Extract email from error message or use a form
    // For now, redirect to a resend page or show a form
    router.push('/resend-verification');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-700 mb-2">
            Email Verification
          </h1>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
            <p className="text-center text-gray-600">Verifying your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-4">
                Your email address has been successfully verified.
              </p>
              <p className="text-sm text-gray-500">Redirecting you now...</p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="h-12 w-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <div className="space-y-3">
                <Button
                  onClick={handleResend}
                  variant="primary"
                  className="w-full"
                  disabled={isResending}
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
                <Link href="/login">
                  <Button variant="secondary" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

