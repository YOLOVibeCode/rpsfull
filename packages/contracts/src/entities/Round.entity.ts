/**
 * Round Entity
 * 
 * Represents a single round within a match
 */

import { RoundResult } from '../enums';
import { IPlayerPublic } from './Player.entity';

/**
 * Round entity representing a single round within a match
 */
export interface IRound {
  readonly id: string;
  readonly matchId: string;
  readonly roundNumber: number;
  readonly player1Move?: string;
  readonly player2Move?: string;
  readonly result: RoundResult;
  readonly winnerId?: string;
  readonly player1TimeMs?: number;
  readonly player2TimeMs?: number;
  readonly timestamp: Date;
}

/**
 * Data for creating a new round
 */
export interface IRoundCreate {
  matchId: string;
  roundNumber: number;
  player1Move?: string;
  player2Move?: string;
  result: RoundResult;
  winnerId?: string;
  player1TimeMs?: number;
  player2TimeMs?: number;
}

/**
 * Round with populated winner data
 */
export interface IRoundWithDetails extends IRound {
  readonly winner?: IPlayerPublic;
}

