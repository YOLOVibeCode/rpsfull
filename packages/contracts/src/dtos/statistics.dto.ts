/**
 * Statistics DTOs
 * 
 * Data Transfer Objects for statistics operations
 */

import { IPlayerStatistics } from '../entities/PlayerStatistics.entity';

/**
 * Player statistics response DTO
 */
export interface IPlayerStatisticsDto {
  statistics: IPlayerStatistics;
}

/**
 * Head-to-head statistics DTO
 */
export interface IHeadToHeadStatsDto {
  player1Id: string;
  player2Id: string;
  totalMatches: number;
  player1Wins: number;
  player2Wins: number;
  ties: number;
  player1WinRate: number;
  player2WinRate: number;
  lastPlayed?: Date;
}

/**
 * Global statistics DTO
 */
export interface IGlobalStatsDto {
  totalPlayers: number;
  totalMatches: number;
  totalTournaments: number;
  activeTournaments: number;
  averageMatchesPerPlayer: number;
  mostPopularGameType?: {
    id: string;
    name: string;
    matchCount: number;
  };
}

/**
 * Leaderboard entry DTO
 */
export interface ILeaderboardEntryDto {
  rank: number;
  playerId: string;
  playerName: string;
  displayName?: string;
  level: number;
  winRate: number;
  totalMatches: number;
  ranking?: number;
}

/**
 * Leaderboard response DTO
 */
export interface ILeaderboardDto {
  gameTypeId?: string;
  entries: ILeaderboardEntryDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

