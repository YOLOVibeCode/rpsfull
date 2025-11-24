/**
 * Tournament Service Interface
 * 
 * ISP: Small, focused interface for tournament operations only
 */

import { ITournament, ITournamentCreate, ITournamentWithDetails } from '../../entities/Tournament.entity';
import { ICreateTournamentDto, IRegisterTournamentDto } from '../../dtos/tournament.dto';
import { TournamentStatus } from '../../enums';

/**
 * Tournament service interface
 * Focused only on tournament creation and management
 */
export interface ITournamentService {
  /**
   * Create a new tournament
   */
  createTournament(data: ICreateTournamentDto, organizerId: string): Promise<ITournament>;

  /**
   * Get tournament by ID
   */
  getTournamentById(tournamentId: string): Promise<ITournamentWithDetails>;

  /**
   * Get tournaments list
   */
  getTournaments(filters?: { status?: TournamentStatus }): Promise<ITournament[]>;

  /**
   * Update tournament
   */
  updateTournament(tournamentId: string, updates: Partial<ITournamentCreate>, organizerId: string): Promise<ITournament>;

  /**
   * Delete tournament
   */
  deleteTournament(tournamentId: string, organizerId: string): Promise<void>;
}

/**
 * Tournament registration service interface
 * ISP: Separated registration operations
 */
export interface ITournamentRegistrationService {
  /**
   * Register a player for a tournament
   */
  registerPlayer(tournamentId: string, playerId: string, data?: IRegisterTournamentDto): Promise<void>;

  /**
   * Unregister a player from a tournament
   */
  unregisterPlayer(tournamentId: string, playerId: string): Promise<void>;

  /**
   * Check if player is registered
   */
  isPlayerRegistered(tournamentId: string, playerId: string): Promise<boolean>;
}

/**
 * Tournament bracket service interface
 * ISP: Separated bracket operations
 */
export interface ITournamentBracketService {
  /**
   * Generate bracket for tournament
   */
  generateBracket(tournamentId: string): Promise<void>;

  /**
   * Get tournament bracket
   */
  getBracket(tournamentId: string): Promise<{
    tournamentId: string;
    currentRound: number;
    rounds: Array<{
      round: number;
      name: string;
      matches: Array<{
        position: number;
        player1Id?: string;
        player2Id?: string;
        matchId?: string;
        winnerId?: string;
      }>;
    }>;
  }>;

  /**
   * Start tournament
   */
  startTournament(tournamentId: string, organizerId: string): Promise<ITournament>;

  /**
   * Advance tournament to next round
   */
  advanceRound(tournamentId: string, organizerId: string): Promise<void>;
}

