/**
 * Match DTOs
 * 
 * Data Transfer Objects for match operations
 */

import { PlayMode } from '../enums';
import { IMatch, IMatchWithDetails } from '../entities/Match.entity';

/**
 * Create match request DTO
 */
export interface ICreateMatchDto {
  player2Id: string;
  gameTypeId: string;
  bestOfN: number;
  playMode: PlayMode;
  tournamentId?: string;
  tiesCount?: boolean;
}

/**
 * Submit move request DTO
 */
export interface ISubmitMoveDto {
  roundNumber: number;
  move: string;
  timeTakenMs?: number;
}

/**
 * Record round request DTO (for live recording mode)
 */
export interface IRecordRoundDto {
  roundNumber: number;
  player1Move: string;
  player2Move: string;
  winnerId?: string;
}

/**
 * Match response DTO
 */
export interface IMatchResponseDto {
  match: IMatchWithDetails;
}

/**
 * Match list response DTO
 */
export interface IMatchListResponseDto {
  matches: IMatch[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Round result response DTO
 */
export interface IRoundResultDto {
  roundNumber: number;
  yourMove: string;
  opponentMove: string | null;
  result: string | null;
  waiting: boolean;
  matchComplete: boolean;
  currentScore?: {
    player1: number;
    player2: number;
  };
}

/**
 * Create match with invitation request DTO
 */
export interface ICreateMatchWithInvitationDto {
  player1: {
    firstName: string;
    lastName: string;
    email: string;
  };
  invitedPlayerEmail?: string;
  gameTypeId?: string;
  bestOfN?: number;
  expirationHours?: number;
}

/**
 * Join match by token request DTO
 */
export interface IJoinMatchByTokenDto {
  token: string;
  player2: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * Match invitation response DTO
 */
export interface IMatchInvitationResponseDto {
  matchId: string;
  invitationToken: string;
  invitationLink: string;
  qrCodeDataUrl: string;
  expiresAt: Date;
  player1Name: string;
}

