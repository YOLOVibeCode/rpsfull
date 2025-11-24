/**
 * Tournament Repository Interface
 * 
 * ISP: Small, focused interface for tournament data access only
 */

import { ITournament, ITournamentCreate, ITournamentUpdate } from '../../entities/Tournament.entity';
import { TournamentStatus } from '../../enums';

/**
 * Tournament repository interface
 * Focused only on tournament CRUD operations
 */
export interface ITournamentRepository {
  /**
   * Create a new tournament
   */
  create(data: ITournamentCreate): Promise<ITournament>;

  /**
   * Find tournament by ID
   */
  findById(id: string): Promise<ITournament | null>;

  /**
   * Find tournaments by organizer
   */
  findByOrganizerId(organizerId: string): Promise<ITournament[]>;

  /**
   * Find tournaments by status
   */
  findByStatus(status: TournamentStatus): Promise<ITournament[]>;

  /**
   * Find all tournaments
   */
  findAll(filters?: { status?: TournamentStatus }): Promise<ITournament[]>;

  /**
   * Update tournament
   */
  update(id: string, data: ITournamentUpdate): Promise<ITournament>;

  /**
   * Delete tournament
   */
  delete(id: string): Promise<void>;
}

