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

  async create(data: IGameTypeCreate & { createdBy?: string }): Promise<IGameType> {
    // Calculate symbolCount from symbols array
    const symbolCount = data.symbols.length;
    
    const result = await this.prisma.gameType.create({
      data: {
        name: data.name,
        description: data.description,
        symbolCount,
        symbols: data.symbols as any,
        winMatrix: data.winMatrix as any,
        tieRules: data.tieRules || 'replay',
        scoringMethod: data.scoringMethod || 'best_of_n',
        isActive: true,
        isDefault: false,
        createdBy: data.createdBy,
      },
    });
    
    // Convert null to undefined for description and cast JsonValue to proper types
    return {
      ...result,
      description: result.description ?? undefined,
      symbols: result.symbols as any,
      winMatrix: result.winMatrix as any,
    } as IGameType;
  }

  async findById(id: string): Promise<IGameType | null> {
    const result = await this.prisma.gameType.findUnique({
      where: { id },
    });
    
    if (!result) return null;
    
    // Convert null to undefined for description and cast JsonValue to proper types
    return {
      ...result,
      description: result.description ?? undefined,
      symbols: result.symbols as any,
      winMatrix: result.winMatrix as any,
    } as IGameType;
  }

  async findDefault(): Promise<IGameType | null> {
    const result = await this.prisma.gameType.findFirst({
      where: { isDefault: true, isActive: true },
    });
    
    if (!result) return null;
    
    // Convert null to undefined for description and cast JsonValue to proper types
    return {
      ...result,
      description: result.description ?? undefined,
      symbols: result.symbols as any,
      winMatrix: result.winMatrix as any,
    } as IGameType;
  }

  async findActive(): Promise<IGameType[]> {
    const results = await this.prisma.gameType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    
    // Convert null to undefined for description and cast JsonValue to proper types
    return results.map(result => ({
      ...result,
      description: result.description ?? undefined,
      symbols: result.symbols as any,
      winMatrix: result.winMatrix as any,
    })) as IGameType[];
  }

  async findAll(): Promise<IGameType[]> {
    const results = await this.prisma.gameType.findMany({
      orderBy: { name: 'asc' },
    });
    
    // Convert null to undefined for description and cast JsonValue to proper types
    return results.map(result => ({
      ...result,
      description: result.description ?? undefined,
      symbols: result.symbols as any,
      winMatrix: result.winMatrix as any,
    })) as IGameType[];
  }

  async searchByName(query: string): Promise<IGameType[]> {
    const results = await this.prisma.gameType.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
    
    // Convert null to undefined for description and cast JsonValue to proper types
    return results.map(result => ({
      ...result,
      description: result.description ?? undefined,
      symbols: result.symbols as any,
      winMatrix: result.winMatrix as any,
    })) as IGameType[];
  }

  async update(id: string, data: IGameTypeUpdate): Promise<IGameType> {
    const updateData: any = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.symbols && { 
        symbols: data.symbols as any,
        symbolCount: data.symbols.length, // Update symbolCount when symbols change
      }),
      ...(data.winMatrix && { winMatrix: data.winMatrix as any }),
      ...(data.tieRules && { tieRules: data.tieRules }),
      ...(data.scoringMethod && { scoringMethod: data.scoringMethod }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    };

    const result = await this.prisma.gameType.update({
      where: { id },
      data: updateData,
    });
    
    // Convert null to undefined for description and cast JsonValue to proper types
    return {
      ...result,
      description: result.description ?? undefined,
      symbols: result.symbols as any,
      winMatrix: result.winMatrix as any,
    } as IGameType;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.gameType.delete({
      where: { id },
    });
  }

  async findByCreator(userId: string): Promise<IGameType[]> {
    const results = await this.prisma.gameType.findMany({
      where: { createdBy: userId },
      orderBy: { createdAt: 'desc' },
    });
    
    // Convert null to undefined for description and cast JsonValue to proper types
    return results.map(result => ({
      ...result,
      description: result.description ?? undefined,
      symbols: result.symbols as any,
      winMatrix: result.winMatrix as any,
    })) as IGameType[];
  }
}

