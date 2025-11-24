/**
 * Auth Validators
 * 
 * Zod schemas for authentication-related validation
 */

import { z } from 'zod';

/**
 * Email validation regex
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Email schema
 */
const emailSchema = z
  .string()
  .email('Invalid email format')
  .regex(emailRegex, 'Invalid email format')
  .transform((val) => val.toLowerCase().trim());

/**
 * Username validation:
 * - 3-30 characters
 * - Alphanumeric + underscore/hyphen only
 * - No spaces
 * - Must start with letter or number
 */
const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .regex(/^[a-zA-Z0-9]/, 'Username must start with a letter or number')
  .transform((val) => val.toLowerCase().trim());

/**
 * Login schema - accepts username OR email
 */
export const loginSchema = z.object({
  username: z.string().optional(),
  email: emailSchema.optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => data.username || data.email, {
  message: 'Either username or email is required',
  path: ['username'],
});

/**
 * Registration schema
 */
export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  firstName: z
    .string()
    .min(1, 'First name must be at least 1 character')
    .max(100, 'First name must be less than 100 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name must be at least 1 character')
    .max(100, 'Last name must be less than 100 characters')
    .optional(),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be less than 100 characters')
    .optional(),
});

/**
 * Email registration schema (magic link)
 */
export const registerEmailSchema = z.object({
  email: emailSchema,
  invitationToken: z.string().optional(),
});

/**
 * Refresh token schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Magic link verification schema
 */
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

/**
 * Username availability check schema
 */
export const checkUsernameSchema = z.object({
  username: usernameSchema,
});

/**
 * Email availability check schema
 */
export const checkEmailSchema = z.object({
  email: emailSchema,
});

