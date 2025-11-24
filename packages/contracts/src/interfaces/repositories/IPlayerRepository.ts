/**
 * Player Repository Interface
 * 
 * ISP: Small, focused interface for player data access only
 */

import { IPlayer, IPlayerCreate, IPlayerUpdate } from '../../entities/Player.entity';

/**
 * Player repository interface
 * Focused only on player CRUD operations
 */
export interface IPlayerRepository {
  /**
   * Create a new player
   */
  create(data: IPlayerCreate): Promise<IPlayer>;

  /**
   * Find player by ID
   */
  findById(id: string): Promise<IPlayer | null>;

  /**
   * Find player by user ID
   */
  findByUserId(userId: string): Promise<IPlayer | null>;

  /**
   * Find player by email
   */
  findByEmail(email: string): Promise<IPlayer | null>;

  /**
   * Search players by name
   */
  searchByName(query: string, limit?: number): Promise<IPlayer[]>;

  /**
   * Find all players with pagination
   */
  findAll(limit?: number, offset?: number): Promise<IPlayer[]>;

  /**
   * Update player
   */
  update(id: string, data: IPlayerUpdate): Promise<IPlayer>;

  /**
   * Delete player
   */
  delete(id: string): Promise<void>;
}

