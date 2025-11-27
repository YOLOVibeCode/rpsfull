/**
 * Player Statistics Repository
 * 
 * Implements IPlayerStatisticsRepository interface using Prisma
 * Following ISP: Small, focused interface implementation
 */

import { PrismaClient } from '@prisma/client';
import {
  IPlayerStatisticsRepository,
  IPlayerStatistics,
  IPlayerStatisticsUpdate,
} from '@rpsfull-platform/contracts';

export class PlayerStatisticsRepository implements IPlayerStatisticsRepository {
  constructor(private prisma: PrismaClient) {}

  async upsert(
    playerId: string,
    gameTypeId: string,
    data: IPlayerStatisticsUpdate
  ): Promise<IPlayerStatistics> {
    const result = await this.prisma.playerStatistics.upsert({
      where: {
        playerId_gameTypeId: {
          playerId,
          gameTypeId,
        },
      },
      create: {
        playerId,
        gameTypeId,
        totalMatches: data.totalMatches || 0,
        matchesWon: data.matchesWon || 0,
        matchesLost: data.matchesLost || 0,
        matchesTied: data.matchesTied || 0,
        winRate: (data.totalMatches || 0) > 0 ? ((data.matchesWon || 0) / (data.totalMatches || 1)) * 100 : 0,
        totalRounds: data.totalRounds || 0,
        roundsWon: data.roundsWon || 0,
        roundsLost: data.roundsLost || 0,
        roundsTied: data.roundsTied || 0,
        longestWinStreak: data.longestWinStreak || 0,
        currentWinStreak: data.currentWinStreak || 0,
        longestLossStreak: data.longestLossStreak || 0,
        currentLossStreak: data.currentLossStreak || 0,
        averageMatchDuration: data.averageMatchDuration || 0,
        favoriteMove: data.favoriteMove,
        leastUsedMove: data.leastUsedMove,
        lastPlayedAt: data.lastPlayedAt,
      },
      update: {
        ...(data.totalMatches !== undefined && { totalMatches: data.totalMatches }),
        ...(data.matchesWon !== undefined && { matchesWon: data.matchesWon }),
        ...(data.matchesLost !== undefined && { matchesLost: data.matchesLost }),
        ...(data.matchesTied !== undefined && { matchesTied: data.matchesTied }),
        ...(data.totalRounds !== undefined && { totalRounds: data.totalRounds }),
        ...(data.roundsWon !== undefined && { roundsWon: data.roundsWon }),
        ...(data.roundsLost !== undefined && { roundsLost: data.roundsLost }),
        ...(data.roundsTied !== undefined && { roundsTied: data.roundsTied }),
        ...(data.longestWinStreak !== undefined && {
          longestWinStreak: data.longestWinStreak,
        }),
        ...(data.currentWinStreak !== undefined && {
          currentWinStreak: data.currentWinStreak,
        }),
        ...(data.longestLossStreak !== undefined && {
          longestLossStreak: data.longestLossStreak,
        }),
        ...(data.currentLossStreak !== undefined && {
          currentLossStreak: data.currentLossStreak,
        }),
        ...(data.averageMatchDuration !== undefined && {
          averageMatchDuration: data.averageMatchDuration,
        }),
        ...(data.favoriteMove !== undefined && { favoriteMove: data.favoriteMove }),
        ...(data.leastUsedMove !== undefined && { leastUsedMove: data.leastUsedMove }),
        ...(data.lastPlayedAt !== undefined && { lastPlayedAt: data.lastPlayedAt }),
      },
    });
    return {
      ...result,
      lastPlayedAt: result.lastPlayedAt ?? undefined,
    } as IPlayerStatistics;
  }

  async findByPlayerAndGameType(
    playerId: string,
    gameTypeId: string
  ): Promise<IPlayerStatistics | null> {
    const result = await this.prisma.playerStatistics.findUnique({
      where: {
        playerId_gameTypeId: {
          playerId,
          gameTypeId,
        },
      },
    });
    if (!result) return null;
    return {
      ...result,
      lastPlayedAt: result.lastPlayedAt ?? undefined,
    } as IPlayerStatistics;
  }

  async findByPlayerId(playerId: string): Promise<IPlayerStatistics[]> {
    const results = await this.prisma.playerStatistics.findMany({
      where: { playerId },
      orderBy: { updatedAt: 'desc' },
    });
    return results.map((result) => ({
      ...result,
      lastPlayedAt: result.lastPlayedAt ?? undefined,
    })) as IPlayerStatistics[];
  }

  async update(
    id: string,
    data: IPlayerStatisticsUpdate
  ): Promise<IPlayerStatistics> {
    const result = await this.prisma.playerStatistics.update({
      where: { id },
      data: {
        ...(data.totalMatches !== undefined && { totalMatches: data.totalMatches }),
        ...(data.matchesWon !== undefined && { matchesWon: data.matchesWon }),
        ...(data.matchesLost !== undefined && { matchesLost: data.matchesLost }),
        ...(data.matchesTied !== undefined && { matchesTied: data.matchesTied }),
        ...(data.totalRounds !== undefined && { totalRounds: data.totalRounds }),
        ...(data.roundsWon !== undefined && { roundsWon: data.roundsWon }),
        ...(data.roundsLost !== undefined && { roundsLost: data.roundsLost }),
        ...(data.roundsTied !== undefined && { roundsTied: data.roundsTied }),
        ...(data.longestWinStreak !== undefined && {
          longestWinStreak: data.longestWinStreak,
        }),
        ...(data.currentWinStreak !== undefined && {
          currentWinStreak: data.currentWinStreak,
        }),
        ...(data.longestLossStreak !== undefined && {
          longestLossStreak: data.longestLossStreak,
        }),
        ...(data.currentLossStreak !== undefined && {
          currentLossStreak: data.currentLossStreak,
        }),
        ...(data.averageMatchDuration !== undefined && {
          averageMatchDuration: data.averageMatchDuration,
        }),
        ...(data.favoriteMove !== undefined && { favoriteMove: data.favoriteMove }),
        ...(data.leastUsedMove !== undefined && { leastUsedMove: data.leastUsedMove }),
        ...(data.lastPlayedAt !== undefined && { lastPlayedAt: data.lastPlayedAt }),
      },
    });
    return {
      ...result,
      lastPlayedAt: result.lastPlayedAt ?? undefined,
    } as IPlayerStatistics;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.playerStatistics.delete({
      where: { id },
    });
  }
}

