/**
 * Match Repository
 * 
 * Implements IMatchRepository interface using Prisma
 * Following ISP: Small, focused interface implementation
 */

import { PrismaClient } from '@prisma/client';
import {
  IMatchRepository,
  IMatch,
  IMatchCreate,
  IMatchUpdate,
  MatchStatus,
} from '@rpsfull-platform/contracts';

export class MatchRepository implements IMatchRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: IMatchCreate): Promise<IMatch> {
    const result = await this.prisma.match.create({
      data: {
        player1Id: data.player1Id,
        player2Id: data.player2Id,
        gameTypeId: data.gameTypeId,
        tournamentId: data.tournamentId,
        bestOfN: data.bestOfN,
        tiesCount: data.tiesCount || false,
        playMode: data.playMode,
        matchFormat: 'best_of_n',
        status: MatchStatus.PENDING,
        player1Score: 0,
        player2Score: 0,
        totalRounds: 0,
        invitationToken: data.invitationToken,
        invitationExpiresAt: data.invitationExpiresAt,
        invitedPlayerEmail: data.invitedPlayerEmail,
        invitationCreatedAt: data.invitationCreatedAt,
      },
    });
    
    // Convert null to undefined for optional fields
    return {
      ...result,
      player2Id: result.player2Id ?? undefined,
      tournamentId: result.tournamentId ?? undefined,
    } as IMatch;
  }

  async findById(id: string): Promise<IMatch | null> {
    const result = await this.prisma.match.findUnique({
      where: { id },
    });
    
    if (!result) return null;
    
    // Convert null to undefined for optional fields
    return {
      ...result,
      player2Id: result.player2Id ?? undefined,
      tournamentId: result.tournamentId ?? undefined,
    } as IMatch;
  }

  async findByPlayerId(
    playerId: string,
    filters?: { status?: MatchStatus }
  ): Promise<IMatch[]> {
    const results = await this.prisma.match.findMany({
      where: {
        OR: [{ player1Id: playerId }, { player2Id: playerId }],
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
    });
    
    // Convert null to undefined for optional fields
    return results.map(result => ({
      ...result,
      player2Id: result.player2Id ?? undefined,
      tournamentId: result.tournamentId ?? undefined,
    })) as IMatch[];
  }

  async findByTournamentId(tournamentId: string): Promise<IMatch[]> {
    const results = await this.prisma.match.findMany({
      where: { tournamentId },
      orderBy: { createdAt: 'asc' },
    });
    return results.map((result) => ({
      ...result,
      player2Id: result.player2Id ?? undefined,
      tournamentId: result.tournamentId ?? undefined,
    })) as IMatch[];
  }

  async update(id: string, data: IMatchUpdate): Promise<IMatch> {
    const result = await this.prisma.match.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.winnerId !== undefined && { winnerId: data.winnerId }),
        ...(data.player1Score !== undefined && { player1Score: data.player1Score }),
        ...(data.player2Score !== undefined && { player2Score: data.player2Score }),
        ...(data.totalRounds !== undefined && { totalRounds: data.totalRounds }),
        ...(data.durationSeconds !== undefined && {
          durationSeconds: data.durationSeconds,
        }),
        ...(data.startedAt !== undefined && { startedAt: data.startedAt }),
        ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
      },
    });
    return {
      ...result,
      player2Id: result.player2Id ?? undefined,
      tournamentId: result.tournamentId ?? undefined,
    } as IMatch;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.match.delete({
      where: { id },
    });
  }

  async findByInvitationToken(token: string): Promise<IMatch | null> {
    const result = await this.prisma.match.findFirst({
      where: {
        invitationToken: token,
      },
    });
    if (!result) return null;
    return {
      ...result,
      player2Id: result.player2Id ?? undefined,
      tournamentId: result.tournamentId ?? undefined,
    } as IMatch;
  }
}

