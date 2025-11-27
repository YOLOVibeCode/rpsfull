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
    const result = await this.prisma.tournament.create({
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
    return {
      ...result,
      description: result.description ?? undefined,
      bracketData: result.bracketData ?? undefined,
      startDate: result.startDate ?? undefined,
      endDate: result.endDate ?? undefined,
    } as ITournament;
  }

  async findById(id: string): Promise<ITournament | null> {
    const result = await this.prisma.tournament.findUnique({
      where: { id },
    });
    if (!result) return null;
    return {
      ...result,
      description: result.description ?? undefined,
      bracketData: result.bracketData ?? undefined,
      startDate: result.startDate ?? undefined,
      endDate: result.endDate ?? undefined,
    } as ITournament;
  }

  async findByInvitationToken(token: string): Promise<ITournament | null> {
    const result = await this.prisma.tournament.findUnique({
      where: { invitationToken: token },
    });
    if (!result) return null;
    return {
      ...result,
      description: result.description ?? undefined,
      bracketData: result.bracketData ?? undefined,
      startDate: result.startDate ?? undefined,
      endDate: result.endDate ?? undefined,
    } as ITournament;
  }

  async findByOrganizerId(organizerId: string): Promise<ITournament[]> {
    const results = await this.prisma.tournament.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((result) => ({
      ...result,
      description: result.description ?? undefined,
      bracketData: result.bracketData ?? undefined,
      startDate: result.startDate ?? undefined,
      endDate: result.endDate ?? undefined,
    })) as ITournament[];
  }

  async findByStatus(status: TournamentStatus): Promise<ITournament[]> {
    const results = await this.prisma.tournament.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    return results.map((result) => ({
      ...result,
      description: result.description ?? undefined,
      bracketData: result.bracketData ?? undefined,
      startDate: result.startDate ?? undefined,
      endDate: result.endDate ?? undefined,
    })) as ITournament[];
  }

  async findAll(filters?: { status?: TournamentStatus }): Promise<ITournament[]> {
    const results = await this.prisma.tournament.findMany({
      where: filters?.status ? { status: filters.status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return results.map((result) => ({
      ...result,
      description: result.description ?? undefined,
      bracketData: result.bracketData ?? undefined,
      startDate: result.startDate ?? undefined,
      endDate: result.endDate ?? undefined,
    })) as ITournament[];
  }

  async update(id: string, data: ITournamentUpdate): Promise<ITournament> {
    const result = await this.prisma.tournament.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status && { status: data.status }),
        ...(data.currentRound !== undefined && { currentRound: data.currentRound }),
        ...(data.bracketData && { bracketData: data.bracketData as any }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.invitationToken !== undefined && { invitationToken: data.invitationToken }),
        ...(data.invitationExpiresAt !== undefined && { invitationExpiresAt: data.invitationExpiresAt }),
        ...(data.invitationCreatedAt !== undefined && { invitationCreatedAt: data.invitationCreatedAt }),
        ...(data.invitationEnabled !== undefined && { invitationEnabled: data.invitationEnabled }),
      },
    });
    return {
      ...result,
      description: result.description ?? undefined,
      bracketData: result.bracketData ?? undefined,
      startDate: result.startDate ?? undefined,
      endDate: result.endDate ?? undefined,
    } as ITournament;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tournament.delete({
      where: { id },
    });
  }
}

