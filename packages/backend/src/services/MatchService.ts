/**
 * Match Service
 * 
 * Implements IMatchService interface
 * Following ISP: Small, focused interface for match management only
 */

import {
  IMatchService,
  ICreateMatchDto,
  IMatch,
  IMatchWithDetails,
  MatchStatus,
} from '@rpsfull-platform/contracts';
import { IMatchRepository } from '@rpsfull-platform/contracts';
import { IPlayerRepository } from '@rpsfull-platform/contracts';
import { IGameTypeRepository } from '@rpsfull-platform/contracts';
import { IRoundRepository } from '@rpsfull-platform/contracts';

export class MatchService implements IMatchService {
  constructor(
    private matchRepository: IMatchRepository,
    private playerRepository: IPlayerRepository,
    private gameTypeRepository: IGameTypeRepository
  ) {}

  async createMatch(data: ICreateMatchDto, player1Id: string): Promise<IMatch> {
    // Validate players
    if (player1Id === data.player2Id) {
      throw new Error('Cannot create match with same player');
    }

    const player1 = await this.playerRepository.findById(player1Id);
    if (!player1) {
      throw new Error('Player 1 not found');
    }

    const player2 = await this.playerRepository.findById(data.player2Id);
    if (!player2) {
      throw new Error('Player 2 not found');
    }

    // Validate game type
    const gameType = await this.gameTypeRepository.findById(data.gameTypeId);
    if (!gameType) {
      throw new Error('Game type not found');
    }

    // Create match
    return this.matchRepository.create({
      player1Id,
      player2Id: data.player2Id,
      gameTypeId: data.gameTypeId,
      bestOfN: data.bestOfN,
      playMode: data.playMode,
      tournamentId: data.tournamentId,
      tiesCount: data.tiesCount,
    });
  }

  async getMatchById(matchId: string): Promise<IMatchWithDetails> {
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    const [player1, player2, gameType, rounds] = await Promise.all([
      this.playerRepository.findById(match.player1Id),
      match.player2Id ? this.playerRepository.findById(match.player2Id) : Promise.resolve(null),
      this.gameTypeRepository.findById(match.gameTypeId),
      (this.matchRepository as any).getRounds?.(matchId) || [],
    ]);

    if (!player1 || !gameType) {
      throw new Error('Match data incomplete');
    }

    if (!player2 && match.status !== MatchStatus.PENDING) {
      throw new Error('Match data incomplete: Player 2 required for non-pending matches');
    }

    return {
      ...match,
      player1: {
        id: player1.id,
        name: player1.name,
        displayName: player1.displayName,
        level: player1.level,
        ranking: player1.ranking,
        bio: player1.bio,
      },
      player2: {
        id: player2.id,
        name: player2.name,
        displayName: player2.displayName,
        level: player2.level,
        ranking: player2.ranking,
        bio: player2.bio,
      },
      gameType: {
        id: gameType.id,
        name: gameType.name,
        description: gameType.description,
        symbolCount: gameType.symbolCount,
        symbols: gameType.symbols as any,
        winMatrix: gameType.winMatrix as any,
        isDefault: gameType.isDefault,
      },
      winner: match.winnerId
        ? {
            id: match.winnerId === player1.id ? player1.id : player2.id,
            name: match.winnerId === player1.id ? player1.name : player2.name,
            displayName:
              match.winnerId === player1.id ? player1.displayName : player2.displayName,
            level: match.winnerId === player1.id ? player1.level : player2.level,
            ranking: match.winnerId === player1.id ? player1.ranking : player2.ranking,
            bio: match.winnerId === player1.id ? player1.bio : player2.bio,
          }
        : undefined,
      rounds: rounds || [],
    };
  }

  async getPlayerMatches(
    playerId: string,
    filters?: { status?: MatchStatus }
  ): Promise<IMatch[]> {
    return this.matchRepository.findByPlayerId(playerId, filters);
  }

  async startMatch(matchId: string, playerId: string): Promise<IMatch> {
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Verify player is participant
    if (match.player1Id !== playerId && match.player2Id !== playerId) {
      throw new Error('Player is not a participant in this match');
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new Error('Match cannot be started');
    }

    return this.matchRepository.update(matchId, {
      status: MatchStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
  }

  async cancelMatch(matchId: string, playerId: string): Promise<void> {
    const match = await this.matchRepository.findById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    // Verify player is participant
    if (match.player1Id !== playerId && match.player2Id !== playerId) {
      throw new Error('Player is not a participant in this match');
    }

    await this.matchRepository.update(matchId, {
      status: MatchStatus.CANCELLED,
    });
  }
}

