/**
 * Game Type Repository
 * 
 * Implements IGameTypeRepository interface using Prisma
 * Following ISP: Small, focused interface implementation
 */

import { PrismaClient } from '@prisma/client';
import {
  IGameTypeRepository,
  IGameType,
  IGameTypeCreate,
  IGameTypeUpdate,
} from '@rpsfull-platform/contracts';

export class GameTypeRepository implements IGameTypeRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: IGameTypeCreate): Promise<IGameType> {
    return this.prisma.gameType.create({
      data: {
        name: data.name,
        description: data.description,
        symbolCount: data.symbolCount,
        symbols: data.symbols as any,
        winMatrix: data.winMatrix as any,
        tieRules: data.tieRules || 'replay',
        scoringMethod: data.scoringMethod || 'best_of_n',
        isActive: true,
        isDefault: false,
      },
    });
  }

  async findById(id: string): Promise<IGameType | null> {
    return this.prisma.gameType.findUnique({
      where: { id },
    });
  }

  async findDefault(): Promise<IGameType | null> {
    return this.prisma.gameType.findFirst({
      where: { isDefault: true, isActive: true },
    });
  }

  async findActive(): Promise<IGameType[]> {
    return this.prisma.gameType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findAll(): Promise<IGameType[]> {
    return this.prisma.gameType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async searchByName(query: string): Promise<IGameType[]> {
    return this.prisma.gameType.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: IGameTypeUpdate): Promise<IGameType> {
    return this.prisma.gameType.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.symbols && { symbols: data.symbols as any }),
        ...(data.winMatrix && { winMatrix: data.winMatrix as any }),
        ...(data.tieRules && { tieRules: data.tieRules }),
        ...(data.scoringMethod && { scoringMethod: data.scoringMethod }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.gameType.delete({
      where: { id },
    });
  }
}

