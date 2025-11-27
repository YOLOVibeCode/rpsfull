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
  IPublicTournamentDto,
  TournamentStatus,
} from '@rpsfull-platform/contracts';
import { ITournamentRepository } from '@rpsfull-platform/contracts';
import { IGameTypeRepository } from '@rpsfull-platform/contracts';
import { TournamentRepository } from '../repositories/TournamentRepository';

export class TournamentService implements ITournamentService {
  constructor(
    private tournamentRepository: ITournamentRepository | TournamentRepository,
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

    // Create tournament - handle interface mismatch
    const repo = this.tournamentRepository as any as TournamentRepository;
    return repo.create(data, organizerId);
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

  async getTournaments(filters?: { status?: TournamentStatus }): Promise<ITournament[]> {
    return this.tournamentRepository.findAll(filters);
  }

  async getPublicTournamentById(tournamentId: string): Promise<IPublicTournamentDto> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const gameType = await this.gameTypeRepository.findById(tournament.gameTypeId);
    if (!gameType) {
      throw new Error('Game type not found');
    }

    // Return only public fields (no sensitive data)
    return {
      id: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournamentType: tournament.tournamentType as any,
      status: tournament.status as any,
      currentParticipants: tournament.participantCount,
      maxParticipants: tournament.maxParticipants,
      startDate: tournament.startDate,
      registrationDeadline: tournament.registrationDeadline,
      gameType: {
        name: gameType.name,
        description: gameType.description,
      },
    };
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

