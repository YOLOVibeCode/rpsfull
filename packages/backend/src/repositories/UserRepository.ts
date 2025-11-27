/**
 * User Repository
 * 
 * Implements IUserRepository interface using Prisma
 * Following ISP: Small, focused interface implementation
 */

import { PrismaClient } from '@prisma/client';
import { IUserRepository, IUser, IUserCreate, IUserUpdate } from '@rpsfull-platform/contracts';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: IUserCreate): Promise<IUser> {
    if (!data.email) {
      throw new Error('Email is required to create a user');
    }
    
    const result = await this.prisma.user.create({
      data: {
        username: data.username ? data.username.toLowerCase().trim() : null,
        email: data.email.toLowerCase().trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash: data.passwordHash,
        role: data.role || 'player',
        isEmailVerified: false,
        isActive: true,
      },
    });
    return {
      ...result,
      firstName: result.firstName ?? undefined,
      lastName: result.lastName ?? undefined,
      verificationToken: result.verificationToken ?? undefined,
      resetToken: result.resetToken ?? undefined,
      resetTokenExpiry: result.resetTokenExpiry ?? undefined,
    } as IUser;
  }

  async findById(id: string): Promise<IUser | null> {
    const result = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!result) return null;
    return {
      ...result,
      firstName: result.firstName ?? undefined,
      lastName: result.lastName ?? undefined,
      verificationToken: result.verificationToken ?? undefined,
      resetToken: result.resetToken ?? undefined,
      resetTokenExpiry: result.resetTokenExpiry ?? undefined,
    } as IUser;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const result = await this.prisma.user.findFirst({
      where: { 
        email: email.toLowerCase().trim(),
        deletedAt: null,
      },
    });
    if (!result) return null;
    return {
      ...result,
      firstName: result.firstName ?? undefined,
      lastName: result.lastName ?? undefined,
      verificationToken: result.verificationToken ?? undefined,
      resetToken: result.resetToken ?? undefined,
      resetTokenExpiry: result.resetTokenExpiry ?? undefined,
    } as IUser;
  }

  async findByUsername(username: string): Promise<IUser | null> {
    const result = await this.prisma.user.findFirst({
      where: {
        username: username.toLowerCase().trim(),
        deletedAt: null,
      },
    });
    if (!result) return null;
    return {
      ...result,
      firstName: result.firstName ?? undefined,
      lastName: result.lastName ?? undefined,
      verificationToken: result.verificationToken ?? undefined,
      resetToken: result.resetToken ?? undefined,
      resetTokenExpiry: result.resetTokenExpiry ?? undefined,
    } as IUser;
  }

  async findByUsernameOrEmail(identifier: string): Promise<IUser | null> {
    const normalized = identifier.toLowerCase().trim();
    // Check if it looks like an email
    const isEmail = normalized.includes('@');
    
    if (isEmail) {
      return this.findByEmail(normalized);
    } else {
      return this.findByUsername(normalized);
    }
  }

  async update(id: string, data: IUserUpdate): Promise<IUser> {
    const result = await this.prisma.user.update({
      where: { id },
      data: {
        ...(data.username && { username: data.username.toLowerCase().trim() }),
        ...(data.email && { email: data.email.toLowerCase().trim() }),
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.passwordHash && { passwordHash: data.passwordHash }),
        ...(data.role && { role: data.role }),
        ...(data.isEmailVerified !== undefined && { isEmailVerified: data.isEmailVerified }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.verificationToken !== undefined && { verificationToken: data.verificationToken }),
        ...(data.resetToken !== undefined && { resetToken: data.resetToken }),
        ...(data.resetTokenExpiry !== undefined && { resetTokenExpiry: data.resetTokenExpiry }),
      },
    });
    return {
      ...result,
      firstName: result.firstName ?? undefined,
      lastName: result.lastName ?? undefined,
      verificationToken: result.verificationToken ?? undefined,
      resetToken: result.resetToken ?? undefined,
      resetTokenExpiry: result.resetTokenExpiry ?? undefined,
    } as IUser;
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: { 
        email: email.toLowerCase().trim(),
        deletedAt: null,
      },
      select: { id: true },
    });
    return user !== null;
  }

  async usernameExists(username: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: username.toLowerCase().trim(),
        deletedAt: null,
      },
      select: { id: true },
    });
    return user !== null;
  }

  async findByVerificationToken(token: string): Promise<IUser | null> {
    const result = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        deletedAt: null,
      },
    });
    if (!result) return null;
    return {
      ...result,
      firstName: result.firstName ?? undefined,
      lastName: result.lastName ?? undefined,
      verificationToken: result.verificationToken ?? undefined,
      resetToken: result.resetToken ?? undefined,
      resetTokenExpiry: result.resetTokenExpiry ?? undefined,
    } as IUser;
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    const result = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        deletedAt: null,
      },
    });
    if (!result) return null;
    return {
      ...result,
      firstName: result.firstName ?? undefined,
      lastName: result.lastName ?? undefined,
      verificationToken: result.verificationToken ?? undefined,
      resetToken: result.resetToken ?? undefined,
      resetTokenExpiry: result.resetTokenExpiry ?? undefined,
    } as IUser;
  }
}

