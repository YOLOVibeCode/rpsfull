/**
 * Round Repository
 * 
 * Implements IRoundRepository interface using Prisma
 * Following ISP: Small, focused interface implementation
 */

import { PrismaClient } from '@prisma/client';
import { IRoundRepository, IRound, IRoundCreate } from '@rpsfull-platform/contracts';

export class RoundRepository implements IRoundRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: IRoundCreate): Promise<IRound> {
    return this.prisma.round.create({
      data: {
        matchId: data.matchId,
        roundNumber: data.roundNumber,
        player1Move: data.player1Move,
        player2Move: data.player2Move,
        result: data.result,
        winnerId: data.winnerId,
        player1TimeMs: data.player1TimeMs,
        player2TimeMs: data.player2TimeMs,
      },
    });
  }

  async findById(id: string): Promise<IRound | null> {
    return this.prisma.round.findUnique({
      where: { id },
    });
  }

  async findByMatchId(matchId: string): Promise<IRound[]> {
    return this.prisma.round.findMany({
      where: { matchId },
      orderBy: { roundNumber: 'asc' },
    });
  }

  async findByMatchAndRound(
    matchId: string,
    roundNumber: number
  ): Promise<IRound | null> {
    return this.prisma.round.findFirst({
      where: {
        matchId,
        roundNumber,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.round.delete({
      where: { id },
    });
  }
}

