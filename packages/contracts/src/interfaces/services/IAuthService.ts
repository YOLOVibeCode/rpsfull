/**
 * Auth Service Interface
 * 
 * ISP: Small, focused interface for authentication operations only
 */

import { IUser, IUserPublic } from '../../entities/User.entity';
import { 
  ILoginDto, 
  IRegisterDto, 
  IRegisterEmailDto, 
  IAuthResponseDto, 
  IRefreshTokenResponseDto,
  IForgotPasswordDto,
  IResetPasswordDto,
  IForgotPasswordResponseDto,
} from '../../dtos/auth.dto';

/**
 * Authentication service interface
 * Focused only on authentication operations
 */
export interface IAuthService {
  /**
   * Register a new user with email and password
   */
  register(data: IRegisterDto): Promise<IAuthResponseDto>;

  /**
   * Register a new user with email only (magic link)
   */
  registerWithEmail(data: IRegisterEmailDto): Promise<{ email: string; expiresIn: number }>;

  /**
   * Verify email with magic link token
   */
  verifyEmail(token: string): Promise<IAuthResponseDto>;

  /**
   * Login with email and password
   */
  login(data: ILoginDto): Promise<IAuthResponseDto>;

  /**
   * Refresh access token
   */
  refreshToken(refreshToken: string): Promise<IRefreshTokenResponseDto>;

  /**
   * Logout (invalidate tokens)
   */
  logout(userId: string, refreshToken: string): Promise<void>;

  /**
   * Get current user
   */
  getCurrentUser(userId: string): Promise<IUserPublic>;

  /**
   * Check if username is available (case-insensitive)
   */
  checkUsernameAvailability(username: string): Promise<boolean>;

  /**
   * Check if email is available (case-insensitive)
   */
  checkEmailAvailability(email: string): Promise<boolean>;

  /**
   * Request password reset (sends reset email)
   */
  forgotPassword(data: IForgotPasswordDto): Promise<IForgotPasswordResponseDto>;

  /**
   * Reset password with token
   */
  resetPassword(data: IResetPasswordDto): Promise<void>;

  /**
   * Resend verification email
   */
  resendVerificationEmail(email: string): Promise<{ message: string }>;
}

