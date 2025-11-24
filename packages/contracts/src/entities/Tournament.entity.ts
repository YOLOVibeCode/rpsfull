/**
 * Tournament Entity
 * 
 * Represents a tournament competition
 */

import { TournamentType, TournamentStatus } from '../enums';
import { IGameTypePublic } from './GameType.entity';
import { IUserPublic } from './User.entity';
import { ITournamentEntry } from './TournamentEntry.entity';

/**
 * Tournament bracket structure
 */
export interface IBracketMatch {
  readonly position: number;
  readonly player1Id?: string;
  readonly player2Id?: string;
  readonly matchId?: string;
  readonly winnerId?: string;
}

export interface IBracketRound {
  readonly round: number;
  readonly name: string;
  readonly matches: IBracketMatch[];
}

export interface IBracketData {
  readonly rounds: IBracketRound[];
}

/**
 * Tournament entity
 */
export interface ITournament {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly gameTypeId: string;
  readonly organizerId: string;
  readonly tournamentType: TournamentType;
  readonly matchFormat: string;
  readonly bestOfN: number;
  readonly status: TournamentStatus;
  readonly currentRound: number;
  readonly totalRounds?: number;
  readonly maxParticipants?: number;
  readonly participantCount: number;
  readonly bracketData?: IBracketData;
  readonly rules?: string;
  readonly prizeInfo?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly registrationDeadline?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Data for creating a new tournament
 */
export interface ITournamentCreate {
  name: string;
  description?: string;
  gameTypeId: string;
  tournamentType: TournamentType;
  bestOfN: number;
  maxParticipants?: number;
  rules?: string;
  prizeInfo?: string;
  startDate?: Date;
  registrationDeadline?: Date;
}

/**
 * Data for updating an existing tournament
 */
export interface ITournamentUpdate {
  name?: string;
  description?: string;
  status?: TournamentStatus;
  currentRound?: number;
  bracketData?: IBracketData;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Tournament with populated related data
 */
export interface ITournamentWithDetails extends ITournament {
  readonly gameType: IGameTypePublic;
  readonly organizer: IUserPublic;
  readonly entries?: ITournamentEntry[];
}

