/**
 * User Repository Interface
 * 
 * ISP: Small, focused interface for user data access only
 */

import { IUser, IUserCreate, IUserUpdate } from '../../entities/User.entity';

/**
 * User repository interface
 * Focused only on user CRUD operations
 */
export interface IUserRepository {
  /**
   * Create a new user
   */
  create(data: IUserCreate): Promise<IUser>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<IUser | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<IUser | null>;

  /**
   * Update user
   */
  update(id: string, data: IUserUpdate): Promise<IUser>;

  /**
   * Delete user (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Find user by username (case-insensitive)
   */
  findByUsername(username: string): Promise<IUser | null>;

  /**
   * Find user by username OR email (case-insensitive)
   */
  findByUsernameOrEmail(identifier: string): Promise<IUser | null>;

  /**
   * Check if email exists (case-insensitive)
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Check if username exists (case-insensitive)
   */
  usernameExists(username: string): Promise<boolean>;

  /**
   * Find user by verification token
   */
  findByVerificationToken(token: string): Promise<IUser | null>;

  /**
   * Find user by password reset token
   */
  findByResetToken(token: string): Promise<IUser | null>;
}

