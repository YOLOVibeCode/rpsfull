/**
 * Round Repository Interface
 * 
 * ISP: Small, focused interface for round data access only
 */

import { IRound, IRoundCreate } from '../../entities/Round.entity';

/**
 * Round repository interface
 * Focused only on round CRUD operations
 */
export interface IRoundRepository {
  /**
   * Create a new round
   */
  create(data: IRoundCreate): Promise<IRound>;

  /**
   * Find round by ID
   */
  findById(id: string): Promise<IRound | null>;

  /**
   * Find rounds by match ID
   */
  findByMatchId(matchId: string): Promise<IRound[]>;

  /**
   * Find round by match and round number
   */
  findByMatchAndRound(matchId: string, roundNumber: number): Promise<IRound | null>;

  /**
   * Delete round
   */
  delete(id: string): Promise<void>;
}

