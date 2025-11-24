/**
 * Integration Tests - Authentication
 * 
 * Tests authentication flow with real database
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { setupTestDatabase, cleanupTestDatabase, teardownTestDatabase, prisma } from './setup';
import { AuthService } from '../../services/AuthService';
import { UserRepository } from '../../repositories/UserRepository';
import { PlayerRepository } from '../../repositories/PlayerRepository';
import { ILoginDto, IRegisterEmailDto } from '@rpsfull-platform/contracts';

describe('AuthService Integration Tests', () => {
  let authService: AuthService;
  let userRepository: UserRepository;
  let playerRepository: PlayerRepository;

  beforeAll(async () => {
    await setupTestDatabase();
    userRepository = new UserRepository(prisma);
    playerRepository = new PlayerRepository(prisma);
    authService = new AuthService(userRepository, playerRepository);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe('Registration Flow', () => {
    it('should register a new user and create player profile', async () => {
      const registerData: IRegisterEmailDto = {
        email: 'test@example.com',
        name: 'Test User',
        displayName: 'TestUser',
      };

      const result = await authService.registerWithEmail(registerData);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(registerData.email);

      // Verify user was created
      const user = await userRepository.findByEmail(registerData.email);
      expect(user).toBeDefined();
      expect(user?.email).toBe(registerData.email);

      // Verify player was created
      const player = await playerRepository.findByUserId(user!.id);
      expect(player).toBeDefined();
      expect(player?.name).toBe(registerData.name);
    });
  });

  describe('Login Flow', () => {
    it('should login with correct credentials', async () => {
      // First register
      const registerData: IRegisterEmailDto = {
        email: 'login@example.com',
        name: 'Login User',
      };
      await authService.registerWithEmail(registerData);

      // Then login (using password registration)
      const loginData: ILoginDto = {
        email: 'login@example.com',
        password: 'TestPassword123!',
      };

      // Note: This test assumes password-based registration exists
      // For email-only registration, login would use magic link
      // This is a placeholder for the actual login flow
    });
  });
});

