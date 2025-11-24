/**
 * Player Entity
 * 
 * Represents a player profile in the system
 */

/**
 * Player entity - full player data
 */
export interface IPlayer {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly displayName?: string;
  readonly email: string;
  readonly avatarUrl?: string;
  readonly bio?: string;
  readonly level: number;
  readonly experience: number;
  readonly ranking?: number;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Data for creating a new player
 */
export interface IPlayerCreate {
  userId: string;
  name: string;
  displayName?: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

/**
 * Data for updating an existing player
 */
export interface IPlayerUpdate {
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
}

/**
 * Public player data - safe to expose in API responses
 */
export interface IPlayerPublic {
  readonly id: string;
  readonly name: string;
  readonly displayName?: string;
  readonly avatarUrl?: string;
  readonly level: number;
  readonly ranking?: number;
  readonly bio?: string;
}

/**
 * Player with statistics included
 */
export interface IPlayerWithStats extends IPlayerPublic {
  readonly totalMatches: number;
  readonly winRate: number;
  readonly tournamentsWon: number;
}

