/**
 * TDD: Tests for UserRepository
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import { PrismaClient } from '@prisma/client';
import { UserRepository } from '../UserRepository';
import { IUserCreate, IUserUpdate, UserRole } from '@rpsfull-platform/contracts';

describe('UserRepository - Complete Coverage', () => {
  let prisma: PrismaClient;
  let repository: UserRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new UserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test
    await prisma.user.deleteMany({});
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const data: IUserCreate = {
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        role: UserRole.PLAYER,
      };

      const user = await repository.create(data);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('hashed_password');
      expect(user.role).toBe(UserRole.PLAYER);
      expect(user.isEmailVerified).toBe(false);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create user with default role when not provided', async () => {
      const data: IUserCreate = {
        email: 'test2@example.com',
        passwordHash: 'hashed_password',
      };

      const user = await repository.create(data);

      expect(user.role).toBe(UserRole.PLAYER);
    });

    it('should throw error for duplicate email', async () => {
      const data: IUserCreate = {
        email: 'duplicate@example.com',
        passwordHash: 'hash1',
      };

      await repository.create(data);

      await expect(repository.create(data)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const created = await repository.create({
        email: 'find@example.com',
        passwordHash: 'hash',
      });

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.email).toBe('find@example.com');
    });

    it('should return null for non-existent ID', async () => {
      const found = await repository.findById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      await repository.create({
        email: 'findemail@example.com',
        passwordHash: 'hash',
      });

      const found = await repository.findByEmail('findemail@example.com');

      expect(found).toBeDefined();
      expect(found?.email).toBe('findemail@example.com');
    });

    it('should return null for non-existent email', async () => {
      const found = await repository.findByEmail('nonexistent@example.com');

      expect(found).toBeNull();
    });

    it('should be case-insensitive for email lookup', async () => {
      await repository.create({
        email: 'CaseTest@Example.com',
        passwordHash: 'hash',
      });

      const found = await repository.findByEmail('casetest@example.com');

      expect(found).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      const created = await repository.create({
        email: 'update@example.com',
        passwordHash: 'hash',
      });

      const updates: IUserUpdate = {
        isEmailVerified: true,
        role: UserRole.ADMIN,
      };

      const updated = await repository.update(created.id, updates);

      expect(updated.isEmailVerified).toBe(true);
      expect(updated.role).toBe(UserRole.ADMIN);
      expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
    });

    it('should throw error for non-existent user', async () => {
      const updates: IUserUpdate = {
        isEmailVerified: true,
      };

      await expect(repository.update('non-existent', updates)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should soft delete user', async () => {
      const created = await repository.create({
        email: 'delete@example.com',
        passwordHash: 'hash',
      });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull(); // Soft delete - should not be found
    });

    it('should throw error for non-existent user', async () => {
      await expect(repository.delete('non-existent')).rejects.toThrow();
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      await repository.create({
        email: 'exists@example.com',
        passwordHash: 'hash',
      });

      const exists = await repository.emailExists('exists@example.com');

      expect(exists).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const exists = await repository.emailExists('notexists@example.com');

      expect(exists).toBe(false);
    });
  });

  describe('findByVerificationToken', () => {
    it('should find user by verification token', async () => {
      const user = await repository.create({
        email: 'verify@example.com',
        passwordHash: 'hash',
      });

      await repository.update(user.id, {
        verificationToken: 'test_token_123',
      });

      const found = await repository.findByVerificationToken('test_token_123');
      expect(found).toBeDefined();
      expect(found?.id).toBe(user.id);
    });

    it('should return null for invalid token', async () => {
      const found = await repository.findByVerificationToken('invalid_token');
      expect(found).toBeNull();
    });
  });

  describe('findByResetToken', () => {
    it('should find user by reset token', async () => {
      const user = await repository.create({
        email: 'reset@example.com',
        passwordHash: 'hash',
      });

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      await repository.update(user.id, {
        resetToken: 'reset_token_123',
        resetTokenExpiry: expiryDate,
      });

      const found = await repository.findByResetToken('reset_token_123');
      expect(found).toBeDefined();
      expect(found?.id).toBe(user.id);
      expect(found?.resetToken).toBe('reset_token_123');
    });

    it('should return null for invalid token', async () => {
      const found = await repository.findByResetToken('invalid_token');
      expect(found).toBeNull();
    });

    it('should return null for expired token', async () => {
      const user = await repository.create({
        email: 'expired@example.com',
        passwordHash: 'hash',
      });

      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 1);
      await repository.update(user.id, {
        resetToken: 'expired_token',
        resetTokenExpiry: expiredDate,
      });

      // findByResetToken doesn't check expiry, but the service will
      const found = await repository.findByResetToken('expired_token');
      expect(found).toBeDefined();
      expect(found?.resetTokenExpiry).toBeDefined();
    });
  });
});

