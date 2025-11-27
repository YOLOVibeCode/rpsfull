/**
 * Tournament Entry Repository
 * 
 * Implements ITournamentEntryRepository interface using Prisma
 * Following ISP: Small, focused interface implementation
 */

import { PrismaClient } from '@prisma/client';
import {
  ITournamentEntryRepository,
  ITournamentEntry,
  ITournamentEntryCreate,
  ITournamentEntryUpdate,
  TournamentEntryStatus,
} from '@rpsfull-platform/contracts';

export class TournamentEntryRepository implements ITournamentEntryRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: ITournamentEntryCreate): Promise<ITournamentEntry> {
    const result = await this.prisma.tournamentEntry.create({
      data: {
        tournamentId: data.tournamentId,
        playerId: data.playerId,
        seed: data.seed,
        status: TournamentEntryStatus.REGISTERED,
        matchesWon: 0,
        matchesLost: 0,
        roundsWon: 0,
        roundsLost: 0,
      },
    });
    return {
      ...result,
      seed: result.seed ?? undefined,
      placement: result.placement ?? undefined,
      eliminatedAt: result.eliminatedAt ?? undefined,
    } as ITournamentEntry;
  }

  async findById(id: string): Promise<ITournamentEntry | null> {
    const result = await this.prisma.tournamentEntry.findUnique({
      where: { id },
    });
    if (!result) return null;
    return {
      ...result,
      seed: result.seed ?? undefined,
      placement: result.placement ?? undefined,
      eliminatedAt: result.eliminatedAt ?? undefined,
    } as ITournamentEntry;
  }

  async findByTournamentAndPlayer(
    tournamentId: string,
    playerId: string
  ): Promise<ITournamentEntry | null> {
    const result = await this.prisma.tournamentEntry.findUnique({
      where: {
        tournamentId_playerId: {
          tournamentId,
          playerId,
        },
      },
    });
    if (!result) return null;
    return {
      ...result,
      seed: result.seed ?? undefined,
      placement: result.placement ?? undefined,
      eliminatedAt: result.eliminatedAt ?? undefined,
    } as ITournamentEntry;
  }

  async findByTournamentId(tournamentId: string): Promise<ITournamentEntry[]> {
    const results = await this.prisma.tournamentEntry.findMany({
      where: { tournamentId },
      orderBy: { seed: 'asc' },
    });
    return results.map((result) => ({
      ...result,
      seed: result.seed ?? undefined,
      placement: result.placement ?? undefined,
      eliminatedAt: result.eliminatedAt ?? undefined,
    })) as ITournamentEntry[];
  }

  async findByPlayerId(playerId: string): Promise<ITournamentEntry[]> {
    const results = await this.prisma.tournamentEntry.findMany({
      where: { playerId },
      orderBy: { registeredAt: 'desc' },
    });
    return results.map((result) => ({
      ...result,
      seed: result.seed ?? undefined,
      placement: result.placement ?? undefined,
      eliminatedAt: result.eliminatedAt ?? undefined,
    })) as ITournamentEntry[];
  }

  async findByStatus(
    tournamentId: string,
    status: TournamentEntryStatus
  ): Promise<ITournamentEntry[]> {
    const results = await this.prisma.tournamentEntry.findMany({
      where: {
        tournamentId,
        status,
      },
      orderBy: { seed: 'asc' },
    });
    return results.map((result) => ({
      ...result,
      seed: result.seed ?? undefined,
      placement: result.placement ?? undefined,
      eliminatedAt: result.eliminatedAt ?? undefined,
    })) as ITournamentEntry[];
  }

  async update(id: string, data: ITournamentEntryUpdate): Promise<ITournamentEntry> {
    const result = await this.prisma.tournamentEntry.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.placement !== undefined && { placement: data.placement }),
        ...(data.matchesWon !== undefined && { matchesWon: data.matchesWon }),
        ...(data.matchesLost !== undefined && { matchesLost: data.matchesLost }),
        ...(data.roundsWon !== undefined && { roundsWon: data.roundsWon }),
        ...(data.roundsLost !== undefined && { roundsLost: data.roundsLost }),
        ...(data.eliminatedAt !== undefined && { eliminatedAt: data.eliminatedAt }),
      },
    });
    return {
      ...result,
      seed: result.seed ?? undefined,
      placement: result.placement ?? undefined,
      eliminatedAt: result.eliminatedAt ?? undefined,
    } as ITournamentEntry;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tournamentEntry.delete({
      where: { id },
    });
  }
}

