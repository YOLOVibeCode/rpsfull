'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from '@/lib/toast';

export default function ResendVerificationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Basic email validation
    if (!email) {
      setErrors({ email: 'Email is required' });
      setIsLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.post('/auth/resend-verification', { email });
      setIsSuccess(true);
      toast.success('Verification email sent', 'Check your inbox for the verification link');
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || 
                     error?.message || 
                     'Failed to send verification email. Please try again.';
      setErrors({ submit: message });
      toast.error('Failed to send email', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear errors when user starts typing
    if (errors['email'] || errors['submit']) {
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-700 mb-2">
            Resend Verification Email
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Enter your email address and we'll send you a new verification link
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              error={errors['email']}
              placeholder="you@example.com"
              autoComplete="email"
            />

            {errors['submit'] && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors['submit']}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Send Verification Email
            </Button>
          </form>
        ) : (
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-4">
                We've sent a verification link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Click the link in the email to verify your account. If you don't see the email, check your spam folder.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center space-y-2">
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm block"
          >
            ← Back to Login
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="text-primary-600 hover:text-primary-700 font-medium text-sm block"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

