/**
 * Tournament Service
 * 
 * Implements ITournamentService interface
 * Following ISP: Small, focused interface for tournament management only
 */

import {
  ITournamentService,
  ICreateTournamentDto,
  ITournament,
  ITournamentWithDetails,
} from '@rpsfull-platform/contracts';
import { ITournamentRepository } from '@rpsfull-platform/contracts';
import { IGameTypeRepository } from '@rpsfull-platform/contracts';
import { IUserRepository } from '@rpsfull-platform/contracts';

export class TournamentService implements ITournamentService {
  constructor(
    private tournamentRepository: ITournamentRepository,
    private gameTypeRepository: IGameTypeRepository
  ) {}

  async createTournament(
    data: ICreateTournamentDto,
    organizerId: string
  ): Promise<ITournament> {
    // Validate game type
    const gameType = await this.gameTypeRepository.findById(data.gameTypeId);
    if (!gameType) {
      throw new Error('Game type not found');
    }

    // Create tournament
    return this.tournamentRepository.create(data, organizerId);
  }

  async getTournamentById(tournamentId: string): Promise<ITournamentWithDetails> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const gameType = await this.gameTypeRepository.findById(tournament.gameTypeId);
    if (!gameType) {
      throw new Error('Game type not found');
    }

    return {
      ...tournament,
      gameType: {
        id: gameType.id,
        name: gameType.name,
        description: gameType.description,
        symbolCount: gameType.symbolCount,
        symbols: gameType.symbols as any,
        winMatrix: gameType.winMatrix as any,
        isDefault: gameType.isDefault,
      },
      organizer: {} as any, // Will be populated from user repository
      entries: [],
    };
  }

  async getTournaments(filters?: { status?: string }): Promise<ITournament[]> {
    return this.tournamentRepository.findAll(filters);
  }

  async updateTournament(
    tournamentId: string,
    updates: Partial<ICreateTournamentDto>,
    organizerId: string
  ): Promise<ITournament> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Verify organizer
    if (tournament.organizerId !== organizerId) {
      throw new Error('Only organizer can update tournament');
    }

    return this.tournamentRepository.update(tournamentId, updates as any);
  }

  async deleteTournament(tournamentId: string, organizerId: string): Promise<void> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Verify organizer
    if (tournament.organizerId !== organizerId) {
      throw new Error('Only organizer can delete tournament');
    }

    await this.tournamentRepository.delete(tournamentId);
  }
}

