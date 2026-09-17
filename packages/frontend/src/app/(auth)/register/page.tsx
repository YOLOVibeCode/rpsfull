'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ValidationIcon, ValidationStatus } from '@/components/ui/ValidationIcon';
import { useUsernameValidation, useEmailValidation } from '@/hooks/api/useValidation';
import { IRegisterDto } from '@rpsfull-platform/contracts';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState<IRegisterDto & { password: string }>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    displayName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Real-time validation
  const usernameValidation = useUsernameValidation(formData.username, {
    enabled: formData.username.length >= 3,
  });
  const emailValidation = useEmailValidation(formData.email, {
    enabled: formData.email.length > 0 && formData.email.includes('@'),
  });

  const getUsernameStatus = (): ValidationStatus => {
    if (!formData.username || formData.username.length < 3) return 'idle';
    if (usernameValidation.checking) return 'checking';
    if (usernameValidation.available === true) return 'valid';
    if (usernameValidation.available === false) return 'invalid';
    return 'idle';
  };

  const getEmailStatus = (): ValidationStatus => {
    if (!formData.email || !formData.email.includes('@')) return 'idle';
    if (emailValidation.checking) return 'checking';
    if (emailValidation.available === true) return 'valid';
    if (emailValidation.available === false) return 'invalid';
    return 'idle';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Client-side validation
    if (usernameValidation.available === false) {
      setErrors({ username: 'Username is already taken' });
      setIsLoading(false);
      return;
    }

    if (emailValidation.available === false) {
      setErrors({ email: 'Email already registered. Please sign in instead.' });
      setIsLoading(false);
      return;
    }

    try {
      await register(formData);
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-700 mb-2">Create Account</h1>
          <p className="text-sm sm:text-base text-gray-600">Join RPSFull and start competing</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                error={errors['username']}
                placeholder="rocky_rocker"
                className="pr-10"
                minLength={3}
                maxLength={30}
                pattern="^[a-zA-Z0-9][a-zA-Z0-9_-]*$"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ValidationIcon
                  status={getUsernameStatus()}
                  message={usernameValidation.message}
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              3-30 characters, letters, numbers, underscores, and hyphens only
            </p>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                error={errors['email']}
                placeholder="you@example.com"
                className="pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ValidationIcon
                  status={getEmailStatus()}
                  message={emailValidation.exists ? 'Email exists - you can sign in' : emailValidation.message}
                />
              </div>
            </div>
            {emailValidation.exists && (
              <p className="mt-1 text-xs text-blue-600">
                This email is already registered. <Link href="/login" className="underline">Sign in instead</Link>
              </p>
            )}
          </div>

          {/* Password Field */}
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            error={errors['password']}
            placeholder="••••••••"
            minLength={8}
          />
          <p className="text-xs text-gray-500 -mt-4">
            At least 8 characters with uppercase, lowercase, and number
          </p>

          {/* First Name Field (Optional) */}
          <Input
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors['firstName']}
            placeholder="Rocky (optional)"
          />

          {/* Last Name Field (Optional) */}
          <Input
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors['lastName']}
            placeholder="Rocker (optional)"
          />

          {/* Display Name Field (Optional) */}
          <Input
            label="Display Name"
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            error={errors['displayName']}
            placeholder="Rocky (optional)"
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
            disabled={
              usernameValidation.checking ||
              emailValidation.checking ||
              usernameValidation.available === false ||
              emailValidation.available === false
            }
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
