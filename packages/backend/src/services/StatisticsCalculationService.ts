/**
 * Statistics Calculation Service
 * 
 * Implements IStatisticsCalculationService interface
 * ISP: Separated calculation operations from statistics retrieval
 */

import {
  IStatisticsCalculationService,
  IPlayerStatistics,
} from '@rpsfull-platform/contracts';
import { IPlayerStatisticsRepository } from '@rpsfull-platform/contracts';
import { IMatchRepository } from '@rpsfull-platform/contracts';
import { IRoundRepository } from '@rpsfull-platform/contracts';
import { MatchStatus, RoundResult } from '@rpsfull-platform/contracts';

export class StatisticsCalculationService implements IStatisticsCalculationService {
  constructor(
    private statisticsRepository: IPlayerStatisticsRepository,
    private matchRepository: IMatchRepository,
    private roundRepository: IRoundRepository
  ) {}

  async calculatePlayerStatistics(
    playerId: string,
    gameTypeId: string
  ): Promise<IPlayerStatistics> {
    // Get all matches for player and game type
    const matches = await this.matchRepository.findByPlayerId(playerId);
    const gameTypeMatches = matches.filter(m => m.gameTypeId === gameTypeId);

    const completedMatches = gameTypeMatches.filter(
      m => m.status === MatchStatus.COMPLETED
    );

    let totalMatches = completedMatches.length;
    let matchesWon = 0;
    let matchesLost = 0;
    let matchesTied = 0;
    let totalRounds = 0;
    let roundsWon = 0;
    let roundsLost = 0;
    let roundsTied = 0;

    // Calculate match statistics
    for (const match of completedMatches) {
      if (match.winnerId === playerId) {
        matchesWon++;
      } else if (match.winnerId && match.winnerId !== playerId) {
        matchesLost++;
      } else {
        matchesTied++;
      }

      // Get rounds for match
      const rounds = await this.roundRepository.findByMatchId(match.id);
      totalRounds += rounds.length;

      for (const round of rounds) {
        if (round.result === RoundResult.PLAYER1_WIN && match.player1Id === playerId) {
          roundsWon++;
        } else if (round.result === RoundResult.PLAYER2_WIN && match.player2Id === playerId) {
          roundsWon++;
        } else if (round.result === RoundResult.TIE) {
          roundsTied++;
        } else {
          roundsLost++;
        }
      }
    }

    const winRate = totalMatches > 0 ? matchesWon / totalMatches : 0;

    // Upsert statistics
    return this.statisticsRepository.upsert(playerId, gameTypeId, {
      totalMatches,
      matchesWon,
      matchesLost,
      matchesTied,
      winRate,
      totalRounds,
      roundsWon,
      roundsLost,
      roundsTied,
    });
  }

  async updateStatisticsAfterMatch(matchId: string): Promise<void> {
    const match = await this.matchRepository.findById(matchId);
    if (!match || match.status !== MatchStatus.COMPLETED) {
      return;
    }

    // Update statistics for both players
    await this.calculatePlayerStatistics(match.player1Id, match.gameTypeId);
    await this.calculatePlayerStatistics(match.player2Id, match.gameTypeId);
  }

  async recalculatePlayerStatistics(playerId: string): Promise<void> {
    // Get all game types player has played
    const matches = await this.matchRepository.findByPlayerId(playerId);
    const gameTypeIds = [...new Set(matches.map(m => m.gameTypeId))];

    // Recalculate for each game type
    for (const gameTypeId of gameTypeIds) {
      await this.calculatePlayerStatistics(playerId, gameTypeId);
    }
  }
}

