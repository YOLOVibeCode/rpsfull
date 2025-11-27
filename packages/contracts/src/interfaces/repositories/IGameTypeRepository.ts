/**
 * Game Type Repository Interface
 * 
 * ISP: Small, focused interface for game type data access only
 */

import { IGameType, IGameTypeCreate, IGameTypeUpdate } from '../../entities/GameType.entity';

/**
 * Game type repository interface
 * Focused only on game type CRUD operations
 */
export interface IGameTypeRepository {
  /**
   * Create a new game type
   */
  create(data: IGameTypeCreate): Promise<IGameType>;

  /**
   * Find game type by ID
   */
  findById(id: string): Promise<IGameType | null>;

  /**
   * Find default game type
   */
  findDefault(): Promise<IGameType | null>;

  /**
   * Find active game types
   */
  findActive(): Promise<IGameType[]>;

  /**
   * Find all game types
   */
  findAll(): Promise<IGameType[]>;

  /**
   * Search game types by name
   */
  searchByName(query: string): Promise<IGameType[]>;

  /**
   * Update game type
   */
  update(id: string, data: IGameTypeUpdate): Promise<IGameType>;

  /**
   * Delete game type
   */
  delete(id: string): Promise<void>;

  /**
   * Find game types created by a specific user
   */
  findByCreator(userId: string): Promise<IGameType[]>;
}

