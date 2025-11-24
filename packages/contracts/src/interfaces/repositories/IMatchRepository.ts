/**
 * Match Repository Interface
 * 
 * ISP: Small, focused interface for match data access only
 */

import { IMatch, IMatchCreate, IMatchUpdate } from '../../entities/Match.entity';
import { MatchStatus } from '../../enums';

/**
 * Match repository interface
 * Focused only on match CRUD operations
 */
export interface IMatchRepository {
  /**
   * Create a new match
   */
  create(data: IMatchCreate): Promise<IMatch>;

  /**
   * Find match by ID
   */
  findById(id: string): Promise<IMatch | null>;

  /**
   * Find matches by player ID
   */
  findByPlayerId(playerId: string, filters?: { status?: MatchStatus }): Promise<IMatch[]>;

  /**
   * Find matches by tournament ID
   */
  findByTournamentId(tournamentId: string): Promise<IMatch[]>;

  /**
   * Update match
   */
  update(id: string, data: IMatchUpdate): Promise<IMatch>;

  /**
   * Delete match
   */
  delete(id: string): Promise<void>;

  /**
   * Find match by invitation token
   */
  findByInvitationToken(token: string): Promise<IMatch | null>;
}

