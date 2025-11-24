/**
 * Match Service Interface
 * 
 * ISP: Small, focused interface for match operations only
 */

import { IMatch, IMatchCreate, IMatchWithDetails } from '../../entities/Match.entity';
import { ICreateMatchDto, ISubmitMoveDto, IRecordRoundDto, IRoundResultDto } from '../../dtos/match.dto';
import { MatchStatus } from '../../enums';

/**
 * Match service interface
 * Focused only on match creation and basic operations
 */
export interface IMatchService {
  /**
   * Create a new match
   */
  createMatch(data: ICreateMatchDto, player1Id: string): Promise<IMatch>;

  /**
   * Get match by ID
   */
  getMatchById(matchId: string): Promise<IMatchWithDetails>;

  /**
   * Get matches for a player
   */
  getPlayerMatches(playerId: string, filters?: { status?: MatchStatus }): Promise<IMatch[]>;

  /**
   * Start a match
   */
  startMatch(matchId: string, playerId: string): Promise<IMatch>;

  /**
   * Cancel a match
   */
  cancelMatch(matchId: string, playerId: string): Promise<void>;
}

/**
 * Match gameplay service interface
 * ISP: Separated gameplay operations from match management
 */
export interface IMatchGameplayService {
  /**
   * Submit a move in a match
   */
  submitMove(matchId: string, playerId: string, data: ISubmitMoveDto): Promise<IRoundResultDto>;

  /**
   * Record a round (for live recording mode)
   */
  recordRound(matchId: string, data: IRecordRoundDto): Promise<IRoundResultDto>;

  /**
   * Get current match state
   */
  getMatchState(matchId: string, playerId: string): Promise<{
    currentRound: number;
    player1Score: number;
    player2Score: number;
    status: MatchStatus;
  }>;
}

