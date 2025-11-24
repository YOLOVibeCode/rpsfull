/**
 * Auth Service
 * 
 * Implements IAuthService interface
 * Following ISP: Small, focused interface implementation
 */

import {
  IAuthService,
  IRegisterDto,
  IRegisterEmailDto,
  IAuthResponseDto,
  IRefreshTokenResponseDto,
  IUserPublic,
  UserRole,
} from '@rpsfull-platform/contracts';
import { IUserRepository } from '@rpsfull-platform/contracts';
import { IPlayerRepository } from '@rpsfull-platform/contracts';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private playerRepository: IPlayerRepository
  ) {}

  async register(data: IRegisterDto): Promise<IAuthResponseDto> {
    // Check if username exists (case-insensitive)
    const usernameExists = await this.userRepository.usernameExists(data.username);
    if (usernameExists) {
      throw new Error('Username already taken');
    }

    // Check if email exists (case-insensitive)
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await this.userRepository.create({
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash,
      role: UserRole.PLAYER,
    });

    // Create player profile
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.username;
    await this.playerRepository.create({
      userId: user.id,
      name: fullName,
      displayName: data.displayName || data.firstName || data.username,
      email: user.email,
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: this.toUserPublic(user),
      accessToken,
      refreshToken,
    };
  }

  async registerWithEmail(data: IRegisterEmailDto): Promise<{ email: string; expiresIn: number }> {
    // Check if email exists
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user with verification token
    await this.userRepository.create({
      email: data.email,
      passwordHash: '', // Will be set on verification
      role: UserRole.PLAYER,
    });

    // Update with verification token
    const user = await this.userRepository.findByEmail(data.email);
    if (user) {
      await this.userRepository.update(user.id, {
        verificationToken,
      });
    }

    return {
      email: data.email,
      expiresIn: 900, // 15 minutes
    };
  }

  async verifyEmail(token: string): Promise<IAuthResponseDto> {
    // Find user by verification token
    const user = await this.userRepository.findByVerificationToken(token);

    if (!user) {
      throw new Error('Invalid verification token');
    }

    // Update user as verified
    const updated = await this.userRepository.update(user.id, {
      isEmailVerified: true,
      verificationToken: undefined,
    });

    // Create player profile if doesn't exist
    const existingPlayer = await this.playerRepository.findByUserId(user.id);
    if (!existingPlayer) {
      await this.playerRepository.create({
        userId: user.id,
        name: user.email.split('@')[0],
        email: user.email,
      });
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(updated.id);
    const refreshToken = this.generateRefreshToken(updated.id);

    return {
      user: this.toUserPublic(updated),
      accessToken,
      refreshToken,
    };
  }

  async login(data: ILoginDto): Promise<IAuthResponseDto> {
    // Find user by username OR email (case-insensitive)
    const user = await this.userRepository.findByUsernameOrEmail(
      data.username || data.email || ''
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await this.userRepository.update(user.id, {
      lastLogin: new Date(),
    });

    // Generate tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: this.toUserPublic(user),
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<IRefreshTokenResponseDto> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refresh_secret'
      ) as { userId: string };

      // Generate new tokens
      const accessToken = this.generateAccessToken(decoded.userId);
      const newRefreshToken = this.generateRefreshToken(decoded.userId);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    // In a real implementation, we would invalidate the refresh token
    // For now, just return success
    return Promise.resolve();
  }

  async getCurrentUser(userId: string): Promise<IUserPublic> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return this.toUserPublic(user);
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    return this.userRepository.usernameExists(username);
  }

  async checkEmailAvailability(email: string): Promise<boolean> {
    return this.userRepository.emailExists(email);
  }

  private generateAccessToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  private toUserPublic(user: any): IUserPublic {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as UserRole,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

