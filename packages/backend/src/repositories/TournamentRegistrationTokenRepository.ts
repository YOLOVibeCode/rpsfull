/**
 * Tournament Registration Token Repository
 * 
 * Handles database operations for tournament registration tokens (magic links)
 * Following ISP: Small, focused interface for registration tokens only
 */

import { PrismaClient } from '@prisma/client';

export interface ITournamentRegistrationToken {
  id: string;
  tournamentId: string;
  email: string;
  token: string;
  firstName?: string;
  lastName?: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export interface ITournamentRegistrationTokenCreate {
  tournamentId: string;
  email: string;
  token: string;
  firstName?: string;
  lastName?: string;
  expiresAt: Date;
}

export class TournamentRegistrationTokenRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: ITournamentRegistrationTokenCreate): Promise<ITournamentRegistrationToken> {
    const result = await this.prisma.tournamentRegistrationToken.create({
      data: {
        tournamentId: data.tournamentId,
        email: data.email.toLowerCase().trim(),
        token: data.token,
        firstName: data.firstName,
        lastName: data.lastName,
        expiresAt: data.expiresAt,
      },
    });
    return {
      ...result,
      firstName: result.firstName ?? undefined,
      lastName: result.lastName ?? undefined,
      usedAt: result.usedAt ?? undefined,
    };
  }

  async findByToken(token: string): Promise<ITournamentRegistrationToken | null> {
    const result = await this.prisma.tournamentRegistrationToken.findUnique({
      where: { token },
    });
    if (!result) return null;
    return {
      ...result,
      firstName: result.firstName ?? undefined,
      lastName: result.lastName ?? undefined,
      usedAt: result.usedAt ?? undefined,
    };
  }

  async findByEmailAndTournament(
    email: string,
    tournamentId: string
  ): Promise<ITournamentRegistrationToken | null> {
    const result = await this.prisma.tournamentRegistrationToken.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        tournamentId,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    if (!result) return null;
    return {
      ...result,
      firstName: result.firstName ?? undefined,
      lastName: result.lastName ?? undefined,
      usedAt: result.usedAt ?? undefined,
    };
  }

  async markUsed(token: string): Promise<void> {
    await this.prisma.tournamentRegistrationToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.tournamentRegistrationToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }
}

