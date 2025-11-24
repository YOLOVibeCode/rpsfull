/**
 * Auth DTOs
 * 
 * Data Transfer Objects for authentication operations
 */

import { IUserPublic } from '../entities/User.entity';

/**
 * Login request DTO
 */
export interface ILoginDto {
  username?: string;
  email?: string;
  password: string;
}

/**
 * Registration request DTO
 */
export interface IRegisterDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

/**
 * Email registration request DTO (magic link)
 */
export interface IRegisterEmailDto {
  email: string;
  invitationToken?: string;
}

/**
 * Authentication response DTO
 */
export interface IAuthResponseDto {
  user: IUserPublic;
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh token request DTO
 */
export interface IRefreshTokenDto {
  refreshToken: string;
}

/**
 * Refresh token response DTO
 */
export interface IRefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

/**
 * Username availability check response DTO
 */
export interface IUsernameAvailabilityDto {
  available: boolean;
  message?: string;
}

/**
 * Email availability check response DTO
 */
export interface IEmailAvailabilityDto {
  available: boolean;
  exists: boolean; // If email exists, user can sign in
  message?: string;
}

