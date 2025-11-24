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
    it('should have email, password, and name properties', () => {
      const dto: IRegisterDto = {
        email: 'user@example.com',
        password: 'SecurePass123',
        name: 'John Doe',
      };

      expect(dto.email).toBe('user@example.com');
      expect(dto.password).toBe('SecurePass123');
      expect(dto.name).toBe('John Doe');
    });

    it('should allow optional displayName', () => {
      const dto: IRegisterDto = {
        email: 'user@example.com',
        password: 'SecurePass123',
        name: 'John Doe',
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
});

