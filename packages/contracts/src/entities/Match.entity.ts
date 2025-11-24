/**
 * Match Entity
 * 
 * Represents a game match between two players
 */

import { PlayMode, MatchStatus } from '../enums';
import { IPlayerPublic } from './Player.entity';
import { IGameTypePublic } from './GameType.entity';
import { IRound } from './Round.entity';

/**
 * Match entity representing a game between two players
 */
export interface IMatch {
  readonly id: string;
  readonly player1Id: string;
  readonly player2Id?: string;
  readonly gameTypeId: string;
  readonly tournamentId?: string;
  readonly matchFormat: string;
  readonly bestOfN: number;
  readonly tiesCount: boolean;
  readonly playMode: PlayMode;
  readonly status: MatchStatus;
  readonly winnerId?: string;
  readonly player1Score: number;
  readonly player2Score: number;
  readonly totalRounds: number;
  readonly durationSeconds?: number;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly invitationToken?: string;
  readonly invitationExpiresAt?: Date;
  readonly invitedPlayerEmail?: string;
  readonly invitationCreatedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Data for creating a new match
 */
export interface IMatchCreate {
  player1Id: string;
  player2Id?: string;
  gameTypeId: string;
  tournamentId?: string;
  bestOfN: number;
  tiesCount?: boolean;
  playMode: PlayMode;
  invitationToken?: string;
  invitationExpiresAt?: Date;
  invitedPlayerEmail?: string;
  invitationCreatedAt?: Date;
}

/**
 * Data for updating an existing match
 */
export interface IMatchUpdate {
  status?: MatchStatus;
  player2Id?: string;
  winnerId?: string;
  player1Score?: number;
  player2Score?: number;
  totalRounds?: number;
  durationSeconds?: number;
  startedAt?: Date;
  completedAt?: Date;
  invitationToken?: string | null;
  invitationExpiresAt?: Date | null;
  invitedPlayerEmail?: string | null;
  invitationCreatedAt?: Date | null;
}

/**
 * Match with populated player and game type data
 */
export interface IMatchWithDetails extends IMatch {
  readonly player1: IPlayerPublic;
  readonly player2: IPlayerPublic;
  readonly winner?: IPlayerPublic;
  readonly gameType: IGameTypePublic;
  readonly rounds?: IRound[];
}

