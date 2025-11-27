/**
 * Statistics Service
 * 
 * Implements IStatisticsService interface
 * Following ISP: Small, focused interface for statistics retrieval only
 */

import {
  IStatisticsService,
  IPlayerStatisticsDto,
  IHeadToHeadStatsDto,
  IGlobalStatsDto,
  ILeaderboardDto,
} from '@rpsfull-platform/contracts';
import { IPlayerStatisticsRepository } from '@rpsfull-platform/contracts';

export class StatisticsService implements IStatisticsService {
  constructor(private statisticsRepository: IPlayerStatisticsRepository) {}

  async getPlayerStatistics(
    playerId: string,
    gameTypeId?: string
  ): Promise<IPlayerStatisticsDto> {
    // If gameTypeId provided, get specific stats
    if (gameTypeId) {
      const stats = await this.statisticsRepository.findByPlayerAndGameType(
        playerId,
        gameTypeId
      );

      if (!stats) {
        // Return empty statistics
        return {
          statistics: {
            id: '',
            playerId,
            gameTypeId,
            totalMatches: 0,
            matchesWon: 0,
            matchesLost: 0,
            matchesTied: 0,
            winRate: 0,
            totalRounds: 0,
            roundsWon: 0,
            roundsLost: 0,
            roundsTied: 0,
            longestWinStreak: 0,
            currentWinStreak: 0,
            longestLossStreak: 0,
            currentLossStreak: 0,
            averageMatchDuration: 0,
            updatedAt: new Date(),
          },
        };
      }

      return { statistics: stats };
    }

    // Return first statistics if no gameTypeId
    const allStats = await this.statisticsRepository.findByPlayerId(playerId);
    if (allStats.length === 0) {
      throw new Error('No statistics found');
    }

    const firstStat = allStats[0];
    if (!firstStat) {
      throw new Error('No statistics found');
    }

    return { statistics: firstStat };
  }

  async getHeadToHeadStats(
    player1Id: string,
    player2Id: string,
    _gameTypeId?: string
  ): Promise<IHeadToHeadStatsDto> {
    // Mock implementation - would query match history
    return {
      player1Id,
      player2Id,
      totalMatches: 0,
      player1Wins: 0,
      player2Wins: 0,
      ties: 0,
      player1WinRate: 0,
      player2WinRate: 0,
    };
  }

  async getGlobalStats(_gameTypeId?: string): Promise<IGlobalStatsDto> {
    // Mock implementation - would aggregate statistics
    return {
      totalPlayers: 0,
      totalMatches: 0,
      totalTournaments: 0,
      activeTournaments: 0,
      averageMatchesPerPlayer: 0,
    };
  }

  async getLeaderboard(
    gameTypeId?: string,
    options?: { page?: number; limit?: number }
  ): Promise<ILeaderboardDto> {
    const page = options?.page || 1;
    const limit = options?.limit || 100;

    // Mock implementation - would query and rank players
    return {
      gameTypeId,
      entries: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

