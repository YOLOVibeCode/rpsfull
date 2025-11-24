/**
 * Tournament Entry Repository Interface
 * 
 * ISP: Small, focused interface for tournament entry data access only
 */

import { ITournamentEntry, ITournamentEntryCreate, ITournamentEntryUpdate } from '../../entities/TournamentEntry.entity';
import { TournamentEntryStatus } from '../../enums';

/**
 * Tournament entry repository interface
 * Focused only on tournament entry CRUD operations
 */
export interface ITournamentEntryRepository {
  /**
   * Create a new tournament entry
   */
  create(data: ITournamentEntryCreate): Promise<ITournamentEntry>;

  /**
   * Find entry by ID
   */
  findById(id: string): Promise<ITournamentEntry | null>;

  /**
   * Find entry by tournament and player
   */
  findByTournamentAndPlayer(tournamentId: string, playerId: string): Promise<ITournamentEntry | null>;

  /**
   * Find entries by tournament ID
   */
  findByTournamentId(tournamentId: string): Promise<ITournamentEntry[]>;

  /**
   * Find entries by player ID
   */
  findByPlayerId(playerId: string): Promise<ITournamentEntry[]>;

  /**
   * Find entries by status
   */
  findByStatus(tournamentId: string, status: TournamentEntryStatus): Promise<ITournamentEntry[]>;

  /**
   * Update entry
   */
  update(id: string, data: ITournamentEntryUpdate): Promise<ITournamentEntry>;

  /**
   * Delete entry
   */
  delete(id: string): Promise<void>;
}

