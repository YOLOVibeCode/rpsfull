/**
 * TDD: Tests for Auth DTOs
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import {
  ILoginDto,
  IRegisterDto,
  IRegisterEmailDto,
  IAuthResponseDto,
  IRefreshTokenDto,
  IForgotPasswordDto,
  IResetPasswordDto,
  IForgotPasswordResponseDto,
} from '../auth.dto';
import { UserRole } from '../../enums';

describe('Auth DTOs - Complete Coverage', () => {
  describe('ILoginDto', () => {
    it('should have email and password properties', () => {
      const dto: ILoginDto = {
        email: 'user@example.com',
        password: 'Password123',
      };

      expect(dto.email).toBe('user@example.com');
      expect(dto.password).toBe('Password123');
    });
  });

  describe('IRegisterDto', () => {
    it('should have username, email, and password properties', () => {
      const dto: IRegisterDto = {
        username: 'johndoe',
        email: 'user@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
      };

      expect(dto.username).toBe('johndoe');
      expect(dto.email).toBe('user@example.com');
      expect(dto.password).toBe('SecurePass123');
      expect(dto.firstName).toBe('John');
      expect(dto.lastName).toBe('Doe');
    });

    it('should allow optional displayName', () => {
      const dto: IRegisterDto = {
        username: 'johndoe',
        email: 'user@example.com',
        password: 'SecurePass123',
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'JohnD',
      };

      expect(dto.displayName).toBe('JohnD');
    });
  });

  describe('IRegisterEmailDto', () => {
    it('should have email property', () => {
      const dto: IRegisterEmailDto = {
        email: 'user@example.com',
      };

      expect(dto.email).toBe('user@example.com');
    });

    it('should allow optional invitationToken', () => {
      const dto: IRegisterEmailDto = {
        email: 'user@example.com',
        invitationToken: 'token-123',
      };

      expect(dto.invitationToken).toBe('token-123');
    });
  });

  describe('IAuthResponseDto', () => {
    it('should have user and tokens', () => {
      const dto: IAuthResponseDto = {
        user: {
          id: 'user-123',
          username: 'testuser',
          email: 'user@example.com',
          role: UserRole.PLAYER,
          isEmailVerified: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      expect(dto.user.id).toBe('user-123');
      expect(dto.accessToken).toBe('access-token');
      expect(dto.refreshToken).toBe('refresh-token');
    });
  });

  describe('IRefreshTokenDto', () => {
    it('should have refreshToken property', () => {
      const dto: IRefreshTokenDto = {
        refreshToken: 'refresh-token-123',
      };

      expect(dto.refreshToken).toBe('refresh-token-123');
    });
  });

  describe('IForgotPasswordDto', () => {
    it('should have email property', () => {
      const dto: IForgotPasswordDto = {
        email: 'user@example.com',
      };

      expect(dto.email).toBe('user@example.com');
    });
  });

  describe('IResetPasswordDto', () => {
    it('should have token and password properties', () => {
      const dto: IResetPasswordDto = {
        token: 'reset-token-123',
        password: 'NewPassword123!',
      };

      expect(dto.token).toBe('reset-token-123');
      expect(dto.password).toBe('NewPassword123!');
    });
  });

  describe('IForgotPasswordResponseDto', () => {
    it('should have message property', () => {
      const dto: IForgotPasswordResponseDto = {
        message: 'Password reset email sent',
      };

      expect(dto.message).toBe('Password reset email sent');
    });
  });
});

