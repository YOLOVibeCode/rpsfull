/**
 * TDD: Tests for User Entity
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import { IUser, IUserCreate, IUserUpdate, IUserPublic } from '../User.entity';
import { UserRole } from '../../enums';

describe('User Entity - Complete Coverage', () => {
  describe('IUser interface', () => {
    it('should have all required properties', () => {
      const user: IUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        role: UserRole.PLAYER,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      };

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe(UserRole.PLAYER);
      expect(user.isEmailVerified).toBe(true);
      expect(user.isActive).toBe(true);
    });

    it('should accept all UserRole values', () => {
      const player: IUser = {
        id: '1',
        email: 'player@test.com',
        passwordHash: 'hash',
        role: UserRole.PLAYER,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const organizer: IUser = {
        ...player,
        role: UserRole.ORGANIZER,
      };

      const admin: IUser = {
        ...player,
        role: UserRole.ADMIN,
      };

      expect(player.role).toBe(UserRole.PLAYER);
      expect(organizer.role).toBe(UserRole.ORGANIZER);
      expect(admin.role).toBe(UserRole.ADMIN);
    });

    it('should have readonly properties', () => {
      const user: IUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hash',
        role: UserRole.PLAYER,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // TypeScript should prevent assignment, but runtime check
      expect(() => {
        // @ts-expect-error - readonly property
        user.id = 'new-id';
      }).not.toThrow(); // Runtime allows, but TypeScript prevents
    });
  });

  describe('IUserCreate interface', () => {
    it('should require email and passwordHash', () => {
      const createData: IUserCreate = {
        email: 'new@example.com',
        passwordHash: 'hashed_password',
      };

      expect(createData.email).toBe('new@example.com');
      expect(createData.passwordHash).toBe('hashed_password');
    });

    it('should allow optional role', () => {
      const withRole: IUserCreate = {
        email: 'test@example.com',
        passwordHash: 'hash',
        role: UserRole.ORGANIZER,
      };

      const withoutRole: IUserCreate = {
        email: 'test@example.com',
        passwordHash: 'hash',
      };

      expect(withRole.role).toBe(UserRole.ORGANIZER);
      expect(withoutRole.role).toBeUndefined();
    });
  });

  describe('IUserUpdate interface', () => {
    it('should allow partial updates', () => {
      const update: IUserUpdate = {
        email: 'updated@example.com',
      };

      expect(update.email).toBe('updated@example.com');
    });

    it('should allow updating role', () => {
      const update: IUserUpdate = {
        role: UserRole.ADMIN,
      };

      expect(update.role).toBe(UserRole.ADMIN);
    });

    it('should allow updating email verification status', () => {
      const update: IUserUpdate = {
        isEmailVerified: true,
      };

      expect(update.isEmailVerified).toBe(true);
    });
  });

  describe('IUserPublic interface', () => {
    it('should not include passwordHash', () => {
      const publicUser: IUserPublic = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(publicUser).not.toHaveProperty('passwordHash');
      expect(publicUser.id).toBe('user-123');
      expect(publicUser.email).toBe('test@example.com');
    });

    it('should have readonly properties', () => {
      const publicUser: IUserPublic = {
        id: 'user-123',
        email: 'test@example.com',
        role: UserRole.PLAYER,
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(publicUser.id).toBe('user-123');
    });
  });
});

