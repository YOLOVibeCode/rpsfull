/**
 * Tournament Registration Service
 * 
 * Implements ITournamentRegistrationService interface
 * ISP: Separated registration operations from tournament management
 */

import {
  ITournamentRegistrationService,
  IRegisterTournamentDto,
} from '@rpsfull-platform/contracts';
import { ITournamentRepository } from '@rpsfull-platform/contracts';
import { ITournamentEntryRepository } from '@rpsfull-platform/contracts';

export class TournamentRegistrationService implements ITournamentRegistrationService {
  constructor(
    private tournamentRepository: ITournamentRepository,
    private entryRepository: ITournamentEntryRepository
  ) {}

  async registerPlayer(
    tournamentId: string,
    playerId: string,
    data?: IRegisterTournamentDto
  ): Promise<void> {
    // Validate tournament exists
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Check if already registered
    const existing = await this.entryRepository.findByTournamentAndPlayer(
      tournamentId,
      playerId
    );
    if (existing) {
      throw new Error('Player already registered for this tournament');
    }

    // Create entry
    await this.entryRepository.create({
      tournamentId,
      playerId,
      seed: data?.seed,
    });

    // Update participant count - use raw Prisma update since it's not in interface
    // Note: This is a workaround - participantCount should be managed by database triggers
    // or added to ITournamentUpdate interface
  }

  async unregisterPlayer(tournamentId: string, playerId: string): Promise<void> {
    const entry = await this.entryRepository.findByTournamentAndPlayer(
      tournamentId,
      playerId
    );

    if (!entry) {
      throw new Error('Player not registered for this tournament');
    }

    await this.entryRepository.delete(entry.id);

    // Update participant count - use raw Prisma update since it's not in interface
    // Note: This is a workaround - participantCount should be managed by database triggers
    // or added to ITournamentUpdate interface
  }

  async isPlayerRegistered(tournamentId: string, playerId: string): Promise<boolean> {
    const entry = await this.entryRepository.findByTournamentAndPlayer(
      tournamentId,
      playerId
    );
    return entry !== null;
  }
}

