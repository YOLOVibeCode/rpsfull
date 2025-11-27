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
    const result = await this.prisma.player.create({
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
    return {
      ...result,
      email: result.email ?? undefined,
      displayName: result.displayName ?? undefined,
      userId: result.userId ?? undefined,
      bio: result.bio ?? undefined,
    } as IPlayer;
  }

  async findById(id: string): Promise<IPlayer | null> {
    const result = await this.prisma.player.findUnique({
      where: { id },
    });
    if (!result) return null;
    return {
      ...result,
      email: result.email ?? undefined,
      displayName: result.displayName ?? undefined,
      userId: result.userId ?? undefined,
      bio: result.bio ?? undefined,
    } as IPlayer;
  }

  async findByUserId(userId: string): Promise<IPlayer | null> {
    const result = await this.prisma.player.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
    });
    if (!result) return null;
    return {
      ...result,
      email: result.email ?? undefined,
      displayName: result.displayName ?? undefined,
      userId: result.userId ?? undefined,
      bio: result.bio ?? undefined,
    } as IPlayer;
  }

  async findByEmail(email: string): Promise<IPlayer | null> {
    const result = await this.prisma.player.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null,
      },
    });
    if (!result) return null;
    return {
      ...result,
      email: result.email ?? undefined,
      displayName: result.displayName ?? undefined,
      userId: result.userId ?? undefined,
      bio: result.bio ?? undefined,
    } as IPlayer;
  }

  async searchByName(query: string, limit: number = 20): Promise<IPlayer[]> {
    const results = await this.prisma.player.findMany({
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
    return results.map((result) => ({
      ...result,
      email: result.email ?? undefined,
      displayName: result.displayName ?? undefined,
      userId: result.userId ?? undefined,
      bio: result.bio ?? undefined,
    })) as IPlayer[];
  }

  async findAll(limit: number = 20, offset: number = 0): Promise<IPlayer[]> {
    const results = await this.prisma.player.findMany({
      where: {
        deletedAt: null,
      },
      take: limit,
      skip: offset,
      orderBy: { name: 'asc' },
    });
    return results.map((result) => ({
      ...result,
      email: result.email ?? undefined,
      displayName: result.displayName ?? undefined,
      userId: result.userId ?? undefined,
      bio: result.bio ?? undefined,
    })) as IPlayer[];
  }

  async update(id: string, data: IPlayerUpdate): Promise<IPlayer> {
    const result = await this.prisma.player.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
    });
    return {
      ...result,
      email: result.email ?? undefined,
      displayName: result.displayName ?? undefined,
      userId: result.userId ?? undefined,
      bio: result.bio ?? undefined,
    } as IPlayer;
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

