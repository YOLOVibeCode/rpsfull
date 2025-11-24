/**
 * Tournament Bracket Service
 * 
 * Implements ITournamentBracketService interface
 * ISP: Separated bracket operations from tournament management
 */

import {
  ITournamentBracketService,
  ITournament,
} from '@rpsfull-platform/contracts';
import { ITournamentRepository } from '@rpsfull-platform/contracts';
import { ITournamentEntryRepository } from '@rpsfull-platform/contracts';
import { TournamentStatus } from '@rpsfull-platform/contracts';

export class TournamentBracketService implements ITournamentBracketService {
  constructor(
    private tournamentRepository: ITournamentRepository,
    private entryRepository: ITournamentEntryRepository
  ) {}

  async generateBracket(tournamentId: string): Promise<void> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const entries = await this.entryRepository.findByTournamentId(tournamentId);

    // Simple bracket generation logic
    const bracketData = this.createBracketData(entries.length, tournament.tournamentType);

    await this.tournamentRepository.update(tournamentId, {
      bracketData: bracketData as any,
    });
  }

  async getBracket(tournamentId: string): Promise<{
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
  }> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const bracketData = tournament.bracketData as any;

    return {
      tournamentId,
      currentRound: tournament.currentRound,
      rounds: bracketData?.rounds || [],
    };
  }

  async startTournament(tournamentId: string, organizerId: string): Promise<ITournament> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.organizerId !== organizerId) {
      throw new Error('Only organizer can start tournament');
    }

    // Generate bracket if not already generated
    if (!tournament.bracketData) {
      await this.generateBracket(tournamentId);
    }

    return this.tournamentRepository.update(tournamentId, {
      status: TournamentStatus.IN_PROGRESS,
    });
  }

  async advanceRound(tournamentId: string, organizerId: string): Promise<void> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.organizerId !== organizerId) {
      throw new Error('Only organizer can advance round');
    }

    await this.tournamentRepository.update(tournamentId, {
      currentRound: tournament.currentRound + 1,
    });
  }

  private createBracketData(
    participantCount: number,
    tournamentType: string
  ): {
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
  } {
    // Simple bracket generation
    const rounds: any[] = [];
    let currentParticipants = participantCount;
    let roundNumber = 1;

    while (currentParticipants > 1) {
      const matches: any[] = [];
      const matchesInRound = Math.ceil(currentParticipants / 2);

      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          position: i + 1,
        });
      }

      rounds.push({
        round: roundNumber,
        name: `Round ${roundNumber}`,
        matches,
      });

      currentParticipants = matchesInRound;
      roundNumber++;
    }

    return { rounds };
  }
}

