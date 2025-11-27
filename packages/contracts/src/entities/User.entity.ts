/**
 * User Entity
 * 
 * Represents a user account in the system
 */

import { UserRole } from '../enums';

/**
 * User entity - full user data including sensitive information
 */
export interface IUser {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly isEmailVerified: boolean;
  readonly isActive: boolean;
  readonly verificationToken?: string | null;
  readonly resetToken?: string | null;
  readonly resetTokenExpiry?: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Data for creating a new user
 */
export interface IUserCreate {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  passwordHash: string;
  role?: UserRole;
}

/**
 * Data for updating an existing user
 */
export interface IUserUpdate {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
  role?: UserRole;
  isEmailVerified?: boolean;
  isActive?: boolean;
  verificationToken?: string | null;
  resetToken?: string | null;
  resetTokenExpiry?: Date | null;
}

/**
 * Public user data - safe to expose in API responses
 * Excludes sensitive information like passwordHash
 */
export interface IUserPublic {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly role: UserRole;
  readonly isEmailVerified: boolean;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

