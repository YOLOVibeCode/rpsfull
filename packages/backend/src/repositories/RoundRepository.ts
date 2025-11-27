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
    const result = await this.prisma.round.create({
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
    return {
      ...result,
      winnerId: result.winnerId ?? undefined,
      player1Move: result.player1Move ?? undefined,
      player2Move: result.player2Move ?? undefined,
      player1TimeMs: result.player1TimeMs ?? undefined,
      player2TimeMs: result.player2TimeMs ?? undefined,
    } as IRound;
  }

  async findById(id: string): Promise<IRound | null> {
    const result = await this.prisma.round.findUnique({
      where: { id },
    });
    if (!result) return null;
    return {
      ...result,
      winnerId: result.winnerId ?? undefined,
      player1Move: result.player1Move ?? undefined,
      player2Move: result.player2Move ?? undefined,
      player1TimeMs: result.player1TimeMs ?? undefined,
      player2TimeMs: result.player2TimeMs ?? undefined,
    } as IRound;
  }

  async findByMatchId(matchId: string): Promise<IRound[]> {
    const results = await this.prisma.round.findMany({
      where: { matchId },
      orderBy: { roundNumber: 'asc' },
    });
    return results.map((result) => ({
      ...result,
      winnerId: result.winnerId ?? undefined,
      player1Move: result.player1Move ?? undefined,
      player2Move: result.player2Move ?? undefined,
      player1TimeMs: result.player1TimeMs ?? undefined,
      player2TimeMs: result.player2TimeMs ?? undefined,
    })) as IRound[];
  }

  async findByMatchAndRound(
    matchId: string,
    roundNumber: number
  ): Promise<IRound | null> {
    const result = await this.prisma.round.findFirst({
      where: {
        matchId,
        roundNumber,
      },
    });
    if (!result) return null;
    return {
      ...result,
      winnerId: result.winnerId ?? undefined,
      player1Move: result.player1Move ?? undefined,
      player2Move: result.player2Move ?? undefined,
      player1TimeMs: result.player1TimeMs ?? undefined,
      player2TimeMs: result.player2TimeMs ?? undefined,
    } as IRound;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.round.delete({
      where: { id },
    });
  }
}

