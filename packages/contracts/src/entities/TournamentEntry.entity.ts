/**
 * Tournament Entry Entity
 * 
 * Represents a player's entry/participation in a tournament
 */

import { TournamentEntryStatus } from '../enums';

/**
 * Tournament entry entity
 */
export interface ITournamentEntry {
  readonly id: string;
  readonly tournamentId: string;
  readonly playerId: string;
  readonly seed?: number;
  readonly status: TournamentEntryStatus;
  readonly placement?: number;
  readonly matchesWon: number;
  readonly matchesLost: number;
  readonly roundsWon: number;
  readonly roundsLost: number;
  readonly registeredAt: Date;
  readonly eliminatedAt?: Date;
}

/**
 * Data for creating a new tournament entry
 */
export interface ITournamentEntryCreate {
  tournamentId: string;
  playerId: string;
  seed?: number;
}

/**
 * Data for updating an existing tournament entry
 */
export interface ITournamentEntryUpdate {
  status?: TournamentEntryStatus;
  placement?: number;
  matchesWon?: number;
  matchesLost?: number;
  roundsWon?: number;
  roundsLost?: number;
  eliminatedAt?: Date;
}

