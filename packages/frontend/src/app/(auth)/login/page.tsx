'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ILoginDto } from '@rpsfull-platform/contracts';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState<ILoginDto & { username?: string }>({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate that either username or email is provided
    if (!formData.username && !formData.email) {
      setErrors({ identifier: 'Please enter either username or email' });
      setIsLoading(false);
      return;
    }

    try {
      // Send only the fields that are provided
      const loginData: ILoginDto = {
        password: formData.password,
        ...(formData.username ? { username: formData.username } : {}),
        ...(formData.email ? { email: formData.email } : {}),
      };
      
      await login(loginData);
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ submit: error.message || 'Login failed. Please check your credentials.' });
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
    if (errors[name] || errors.identifier) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        delete newErrors.identifier;
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-700 mb-2">Welcome Back</h1>
          <p className="text-sm sm:text-base text-gray-600">Sign in to your RPSFull account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
              Username or Email <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <Input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="rocky_rocker"
                className="w-full"
              />
              <div className="text-center text-sm text-gray-500">OR</div>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full"
              />
            </div>
            {errors.identifier && (
              <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter either your username or email address
            </p>
          </div>

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            error={errors.password}
            placeholder="••••••••"
          />

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
