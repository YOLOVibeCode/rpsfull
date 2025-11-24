/**
 * Match Gameplay Service
 * 
 * Implements IMatchGameplayService interface
 * ISP: Separated gameplay operations from match management
 */

import {
  IMatchGameplayService,
  ISubmitMoveDto,
  IRecordRoundDto,
  IRoundResultDto,
  RoundResult,
  MatchStatus,
} from '@rpsfull-platform/contracts';
import { IMatchRepository } from '@rpsfull-platform/contracts';
import { IRoundRepository } from '@rpsfull-platform/contracts';
import { IGameTypeRepository } from '@rpsfull-platform/contracts';

export class MatchGameplayService implements IMatchGameplayService {
  constructor(
    private matchRepository: IMatchRepository,
    private roundRepository: IRoundRepository
  ) {}

  async submitMove(
    matchId: string,
    playerId: string,
    data: ISubmitMoveDto
  ): Promise<IRoundResultDto> {
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Verify player is participant
    if (match.player1Id !== playerId && match.player2Id !== playerId) {
      throw new Error('Player is not a participant in this match');
    }

    // For now, return mock result
    // In real implementation, this would handle move submission logic
    return {
      roundNumber: data.roundNumber,
      yourMove: data.move,
      opponentMove: null,
      result: null,
      waiting: true,
      matchComplete: false,
    };
  }

  async recordRound(matchId: string, data: IRecordRoundDto): Promise<IRoundResultDto> {
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Determine result
    let result: RoundResult;
    if (data.winnerId === match.player1Id) {
      result = RoundResult.PLAYER1_WIN;
    } else if (data.winnerId === match.player2Id) {
      result = RoundResult.PLAYER2_WIN;
    } else {
      result = RoundResult.TIE;
    }

    // Create round
    await this.roundRepository.create({
      matchId,
      roundNumber: data.roundNumber,
      player1Move: data.player1Move,
      player2Move: data.player2Move,
      result,
      winnerId: data.winnerId,
    });

    // Update match scores
    let player1Score = match.player1Score;
    let player2Score = match.player2Score;

    if (result === RoundResult.PLAYER1_WIN) {
      player1Score++;
    } else if (result === RoundResult.PLAYER2_WIN) {
      player2Score++;
    }

    const matchComplete =
      player1Score > match.bestOfN / 2 || player2Score > match.bestOfN / 2;

    await this.matchRepository.update(matchId, {
      player1Score,
      player2Score,
      totalRounds: match.totalRounds + 1,
      status: matchComplete ? MatchStatus.COMPLETED : MatchStatus.IN_PROGRESS,
      completedAt: matchComplete ? new Date() : undefined,
      winnerId: matchComplete
        ? player1Score > player2Score
          ? match.player1Id
          : match.player2Id
        : undefined,
    });

    return {
      roundNumber: data.roundNumber,
      yourMove: data.player1Move,
      opponentMove: data.player2Move,
      result,
      waiting: false,
      matchComplete,
      currentScore: {
        player1: player1Score,
        player2: player2Score,
      },
    };
  }

  async getMatchState(
    matchId: string,
    playerId: string
  ): Promise<{
    currentRound: number;
    player1Score: number;
    player2Score: number;
    status: MatchStatus;
  }> {
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Verify player is participant
    if (match.player1Id !== playerId && match.player2Id !== playerId) {
      throw new Error('Player is not a participant in this match');
    }

    const rounds = await this.roundRepository.findByMatchId(matchId);
    const currentRound = rounds.length + 1;

    return {
      currentRound,
      player1Score: match.player1Score,
      player2Score: match.player2Score,
      status: match.status as MatchStatus,
    };
  }
}

