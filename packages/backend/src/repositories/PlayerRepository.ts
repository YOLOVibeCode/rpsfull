/**
 * Player Repository
 * 
 * Implements IPlayerRepository interface using Prisma
 * Following ISP: Small, focused interface implementation
 */

import { PrismaClient } from '@prisma/client';
import {
  IPlayerRepository,
  IPlayer,
  IPlayerCreate,
  IPlayerUpdate,
} from '@rpsfull-platform/contracts';

export class PlayerRepository implements IPlayerRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: IPlayerCreate): Promise<IPlayer> {
    return this.prisma.player.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        userId: data.userId,
        email: data.email,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        level: 1,
        experience: 0,
        isActive: true,
      },
    });
  }

  async findById(id: string): Promise<IPlayer | null> {
    return this.prisma.player.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<IPlayer | null> {
    return this.prisma.player.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });
  }

  async findByEmail(email: string): Promise<IPlayer | null> {
    return this.prisma.player.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });
  }

  async searchByName(query: string, limit: number = 20): Promise<IPlayer[]> {
    return this.prisma.player.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  async findAll(limit: number = 20, offset: number = 0): Promise<IPlayer[]> {
    return this.prisma.player.findMany({
      where: {
        deletedAt: null,
      },
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: IPlayerUpdate): Promise<IPlayer> {
    return this.prisma.player.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    await this.prisma.player.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}

