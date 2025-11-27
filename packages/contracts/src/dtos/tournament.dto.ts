/**
 * Tournament DTOs
 * 
 * Data Transfer Objects for tournament operations
 */

import { TournamentType, TournamentStatus } from '../enums';
import { ITournament, ITournamentWithDetails, IBracketData } from '../entities/Tournament.entity';
import { ITournamentEntry } from '../entities/TournamentEntry.entity';

/**
 * Create tournament request DTO
 */
export interface ICreateTournamentDto {
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
 * Tournament response DTO
 */
export interface ITournamentResponseDto {
  tournament: ITournamentWithDetails;
}

/**
 * Tournament list response DTO
 */
export interface ITournamentListResponseDto {
  tournaments: ITournament[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Register for tournament request DTO
 */
export interface IRegisterTournamentDto {
  seed?: number;
}

/**
 * Tournament bracket response DTO
 */
export interface ITournamentBracketDto {
  tournamentId: string;
  currentRound: number;
  rounds: IBracketData['rounds'];
}

/**
 * Tournament standings response DTO
 */
export interface ITournamentStandingsDto {
  tournamentId: string;
  standings: Array<{
    playerId: string;
    playerName: string;
    placement: number;
    matchesWon: number;
    matchesLost: number;
    roundsWon: number;
    roundsLost: number;
  }>;
}

/**
 * Tournament invitation request DTO
 */
export interface ITournamentInvitationDto {
  players: Array<{
    name: string;
    email: string;
  }>;
  sendEmail: boolean;
  customMessage?: string;
}

/**
 * Public tournament DTO (no authentication required)
 */
export interface IPublicTournamentDto {
  id: string;
  name: string;
  description?: string;
  tournamentType: TournamentType;
  status: TournamentStatus;
  currentParticipants: number;
  maxParticipants?: number;
  startDate?: Date;
  registrationDeadline?: Date;
  gameType: {
    name: string;
    description?: string;
  };
}

/**
 * Tournament invitation response DTO
 */
export interface ITournamentInvitationResponseDto {
  tournamentId: string;
  invitationToken: string;
  invitationLink: string;
  qrCodeDataUrl: string;
  expiresAt: Date;
  tournamentName: string;
}

/**
 * Tournament invitation details DTO (for join page)
 */
export interface ITournamentInvitationDetailsDto {
  tournamentId: string;
  name: string;
  description?: string;
  tournamentType: TournamentType;
  currentParticipants: number;
  maxParticipants?: number;
  startDate?: Date;
  organizerName: string;
}

/**
 * Join tournament by token request DTO
 */
export interface IJoinTournamentByTokenDto {
  token: string;
  player: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Join tournament result DTO
 */
export interface IJoinTournamentResultDto {
  tournamentId: string;
  playerId: string;
  accessToken: string;
  refreshToken?: string;
}

