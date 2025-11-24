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
    return this.prisma.playerStatistics.upsert({
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
        winRate: data.winRate || 0,
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
        ...(data.winRate !== undefined && { winRate: data.winRate }),
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
  }

  async findByPlayerAndGameType(
    playerId: string,
    gameTypeId: string
  ): Promise<IPlayerStatistics | null> {
    return this.prisma.playerStatistics.findUnique({
      where: {
        playerId_gameTypeId: {
          playerId,
          gameTypeId,
        },
      },
    });
  }

  async findByPlayerId(playerId: string): Promise<IPlayerStatistics[]> {
    return this.prisma.playerStatistics.findMany({
      where: { playerId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(
    id: string,
    data: IPlayerStatisticsUpdate
  ): Promise<IPlayerStatistics> {
    return this.prisma.playerStatistics.update({
      where: { id },
      data: {
        ...(data.totalMatches !== undefined && { totalMatches: data.totalMatches }),
        ...(data.matchesWon !== undefined && { matchesWon: data.matchesWon }),
        ...(data.matchesLost !== undefined && { matchesLost: data.matchesLost }),
        ...(data.matchesTied !== undefined && { matchesTied: data.matchesTied }),
        ...(data.winRate !== undefined && { winRate: data.winRate }),
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
  }

  async delete(id: string): Promise<void> {
    await this.prisma.playerStatistics.delete({
      where: { id },
    });
  }
}

