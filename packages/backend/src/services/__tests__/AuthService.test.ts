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
import { IRegisterDto, ILoginDto, IRegisterEmailDto, IForgotPasswordDto, IResetPasswordDto, UserRole } from '@rpsfull-platform/contracts';
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

  describe('forgotPassword', () => {
    it('should generate reset token for existing user', async () => {
      const email = 'reset@example.com';
      await userRepository.create({
        email,
        passwordHash: 'hash',
      });

      const data: IForgotPasswordDto = { email };
      const result = await authService.forgotPassword(data);

      expect(result.message).toContain('Password reset email sent');
      
      // Verify reset token was generated
      const user = await userRepository.findByEmail(email);
      expect(user?.resetToken).toBeDefined();
      expect(user?.resetTokenExpiry).toBeDefined();
    });

    it('should not reveal if email does not exist (security)', async () => {
      const data: IForgotPasswordDto = { email: 'nonexistent@example.com' };
      
      // Should not throw error, but also not generate token
      const result = await authService.forgotPassword(data);
      expect(result.message).toContain('Password reset email sent');
    });

    it('should set reset token expiry to 1 hour from now', async () => {
      const email = 'expiry@example.com';
      await userRepository.create({
        email,
        passwordHash: 'hash',
      });

      const data: IForgotPasswordDto = { email };
      await authService.forgotPassword(data);

      const user = await userRepository.findByEmail(email);
      expect(user?.resetTokenExpiry).toBeDefined();
      
      if (user?.resetTokenExpiry) {
        const expiryTime = new Date(user.resetTokenExpiry).getTime();
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // Should be approximately 1 hour from now (allow 5 second tolerance)
        expect(expiryTime).toBeGreaterThan(now);
        expect(expiryTime).toBeLessThan(now + oneHour + 5000);
      }
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const email = 'resetpass@example.com';
      const newPassword = 'NewPassword123!';
      const resetToken = 'valid_reset_token';

      const user = await userRepository.create({
        email,
        passwordHash: 'old_hash',
      });

      // Set reset token
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      await userRepository.update(user.id, {
        resetToken,
        resetTokenExpiry: expiryDate,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      const data: IResetPasswordDto = {
        token: resetToken,
        password: newPassword,
      };

      await authService.resetPassword(data);

      // Verify password was updated
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      
      // Verify reset token was cleared
      const updatedUser = await userRepository.findById(user.id);
      expect(updatedUser?.resetToken).toBeNull();
      expect(updatedUser?.resetTokenExpiry).toBeNull();
    });

    it('should throw error for invalid token', async () => {
      const data: IResetPasswordDto = {
        token: 'invalid_token',
        password: 'NewPassword123!',
      };

      await expect(authService.resetPassword(data)).rejects.toThrow('Invalid or expired reset token');
    });

    it('should throw error for expired token', async () => {
      const email = 'expired@example.com';
      const resetToken = 'expired_token';

      const user = await userRepository.create({
        email,
        passwordHash: 'hash',
      });

      // Set expired token (1 hour ago)
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 1);
      await userRepository.update(user.id, {
        resetToken,
        resetTokenExpiry: expiredDate,
      });

      const data: IResetPasswordDto = {
        token: resetToken,
        password: 'NewPassword123!',
      };

      await expect(authService.resetPassword(data)).rejects.toThrow('Invalid or expired reset token');
    });

    it('should hash new password before storing', async () => {
      const email = 'hashnew@example.com';
      const newPassword = 'NewPassword123!';
      const resetToken = 'token_for_hash';

      const user = await userRepository.create({
        email,
        passwordHash: 'old_hash',
      });

      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      await userRepository.update(user.id, {
        resetToken,
        resetTokenExpiry: expiryDate,
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      const data: IResetPasswordDto = {
        token: resetToken,
        password: newPassword,
      };

      await authService.resetPassword(data);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
    });
  });

  describe('resendVerificationEmail', () => {
    it('should generate new verification token for existing user', async () => {
      const email = 'resend@example.com';
      await userRepository.create({
        email,
        passwordHash: 'hash',
      });

      const result = await authService.resendVerificationEmail(email);

      expect(result.message).toContain('Verification email sent');
      
      // Verify new verification token was generated
      const user = await userRepository.findByEmail(email);
      expect(user?.verificationToken).toBeDefined();
    });

    it('should not reveal if email does not exist (security)', async () => {
      const result = await authService.resendVerificationEmail('nonexistent@example.com');
      expect(result.message).toContain('Verification email sent');
    });

    it('should not resend if email already verified', async () => {
      const email = 'verified@example.com';
      const user = await userRepository.create({
        email,
        passwordHash: 'hash',
      });

      await userRepository.update(user.id, {
        isEmailVerified: true,
      });

      const result = await authService.resendVerificationEmail(email);
      expect(result.message).toContain('already verified');
    });
  });
});

