/**
 * Tournament Repository
 * 
 * Implements ITournamentRepository interface using Prisma
 * Following ISP: Small, focused interface implementation
 */

import { PrismaClient } from '@prisma/client';
import {
  ITournamentRepository,
  ITournament,
  ITournamentCreate,
  ITournamentUpdate,
  TournamentStatus,
} from '@rpsfull-platform/contracts';

export class TournamentRepository implements ITournamentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: ITournamentCreate, organizerId: string): Promise<ITournament> {
    return this.prisma.tournament.create({
      data: {
        name: data.name,
        description: data.description,
        gameTypeId: data.gameTypeId,
        organizerId,
        tournamentType: data.tournamentType,
        bestOfN: data.bestOfN,
        maxParticipants: data.maxParticipants,
        rules: data.rules,
        prizeInfo: data.prizeInfo,
        startDate: data.startDate,
        registrationDeadline: data.registrationDeadline,
        status: TournamentStatus.DRAFT,
        currentRound: 0,
        participantCount: 0,
        matchFormat: 'best_of_n',
      },
    });
  }

  async findById(id: string): Promise<ITournament | null> {
    return this.prisma.tournament.findUnique({
      where: { id },
    });
  }

  async findByOrganizerId(organizerId: string): Promise<ITournament[]> {
    return this.prisma.tournament.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: TournamentStatus): Promise<ITournament[]> {
    return this.prisma.tournament.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(filters?: { status?: TournamentStatus }): Promise<ITournament[]> {
    return this.prisma.tournament.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: ITournamentUpdate): Promise<ITournament> {
    return this.prisma.tournament.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.currentRound !== undefined && { currentRound: data.currentRound }),
        ...(data.bracketData && { bracketData: data.bracketData as any }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tournament.delete({
      where: { id },
    });
  }
}

