/**
 * TDD: Tests for AuthService
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import { PrismaClient } from '@prisma/client';
import { AuthService } from '../AuthService';
import { UserRepository } from '../../repositories/UserRepository';
import { PlayerRepository } from '../../repositories/PlayerRepository';
import { IRegisterDto, ILoginDto, IRegisterEmailDto, UserRole } from '@rpsfull-platform/contracts';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService - Complete Coverage', () => {
  let prisma: PrismaClient;
  let userRepository: UserRepository;
  let playerRepository: PlayerRepository;
  let authService: AuthService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    userRepository = new UserRepository(prisma);
    playerRepository = new PlayerRepository(prisma);
    authService = new AuthService(userRepository, playerRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.player.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('register', () => {
    it('should register a new user with email and password', async () => {
      const data: IRegisterDto = {
        email: 'newuser@example.com',
        password: 'SecurePass123',
        name: 'New User',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.register(data);

      expect(result).toBeDefined();
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should create player profile when registering', async () => {
      const data: IRegisterDto = {
        email: 'withplayer@example.com',
        password: 'SecurePass123',
        name: 'Player User',
        displayName: 'PlayerUser',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.register(data);

      expect(result.user).toBeDefined();
      const player = await playerRepository.findByUserId(result.user.id);
      expect(player).toBeDefined();
      expect(player?.name).toBe('Player User');
    });

    it('should hash password before storing', async () => {
      const data: IRegisterDto = {
        email: 'hashpass@example.com',
        password: 'SecurePass123',
        name: 'Hash User',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      await authService.register(data);

      expect(bcrypt.hash).toHaveBeenCalledWith('SecurePass123', 10);
    });
  });

  describe('registerWithEmail', () => {
    it('should register user with email only (magic link)', async () => {
      const data: IRegisterEmailDto = {
        email: 'magiclink@example.com',
      };

      const result = await authService.registerWithEmail(data);

      expect(result.email).toBe('magiclink@example.com');
      expect(result.expiresIn).toBe(900);
    });

    it('should generate verification token', async () => {
      const data: IRegisterEmailDto = {
        email: 'token@example.com',
      };

      const result = await authService.registerWithEmail(data);

      expect(result).toBeDefined();
      // Token should be generated (stored in user record)
      const user = await userRepository.findByEmail(data.email);
      expect(user).toBeDefined();
      expect(user?.verificationToken).toBeDefined();
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token and create user', async () => {
      const email = 'verify@example.com';
      const token = 'verification_token_123';

      // Create user with verification token
      const user = await userRepository.create({
        email,
        passwordHash: 'hash',
      });

      await userRepository.update(user.id, {
        verificationToken: token,
      });

      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.verifyEmail(token);

      expect(result).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.isEmailVerified).toBe(true);
    });

    it('should create player when verifying email', async () => {
      const email = 'verifyplayer@example.com';
      const token = 'token_123';

      const user = await userRepository.create({
        email,
        passwordHash: 'hash',
      });

      await userRepository.update(user.id, {
        verificationToken: token,
      });

      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.verifyEmail(token);

      const player = await playerRepository.findByUserId(result.user.id);
      expect(player).toBeDefined();
    });

    it('should throw error for invalid token', async () => {
      await expect(authService.verifyEmail('invalid_token')).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const email = 'login@example.com';
      const password = 'Password123';

      const hashedPassword = await bcrypt.hash(password, 10);
      await userRepository.create({
        email,
        passwordHash: hashedPassword,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock_token');

      const result = await authService.login({ email, password });

      expect(result).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.accessToken).toBeDefined();
    });

    it('should throw error for incorrect password', async () => {
      const email = 'wrongpass@example.com';
      const password = 'Password123';

      const hashedPassword = await bcrypt.hash('DifferentPassword', 10);
      await userRepository.create({
        email,
        passwordHash: hashedPassword,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login({ email, password })).rejects.toThrow();
    });

    it('should throw error for non-existent user', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'nonexistent@example.com', password: 'pass' })
      ).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshToken = 'valid_refresh_token';

      (jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-123' });
      (jwt.sign as jest.Mock).mockReturnValue('new_access_token');

      const result = await authService.refreshToken(refreshToken);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for invalid refresh token', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.refreshToken('invalid_token')).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const user = await userRepository.create({
        email: 'logout@example.com',
        passwordHash: 'hash',
      });

      await expect(
        authService.logout(user.id, 'refresh_token')
      ).resolves.not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user', async () => {
      const user = await userRepository.create({
        email: 'current@example.com',
        passwordHash: 'hash',
      });

      const result = await authService.getCurrentUser(user.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    });

    it('should throw error for non-existent user', async () => {
      await expect(authService.getCurrentUser('non-existent')).rejects.toThrow();
    });
  });
});

