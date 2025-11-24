/**
 * TDD: Tests for TournamentBracketService
 * 
 * ISP: Separated bracket operations
 */

import { PrismaClient } from '@prisma/client';
import { TournamentBracketService } from '../TournamentBracketService';
import { TournamentRepository } from '../../repositories/TournamentRepository';
import { TournamentEntryRepository } from '../../repositories/TournamentEntryRepository';
import { GameTypeRepository } from '../../repositories/GameTypeRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { TournamentStatus } from '@rpsfull-platform/contracts';

describe('TournamentBracketService - Complete Coverage', () => {
  let prisma: PrismaClient;
  let tournamentRepository: TournamentRepository;
  let entryRepository: TournamentEntryRepository;
  let bracketService: TournamentBracketService;
  let tournament: any;
  let organizer: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    tournamentRepository = new TournamentRepository(prisma);
    entryRepository = new TournamentEntryRepository(prisma);
    bracketService = new TournamentBracketService(tournamentRepository, entryRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.tournamentEntry.deleteMany({});
    await prisma.tournament.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    organizer = await new UserRepository(prisma).create({
      email: 'organizer@test.com',
      passwordHash: 'hash',
    });

    const gameType = await new GameTypeRepository(prisma).create({
      name: 'Test RPS',
      symbolCount: 3,
      symbols: [],
      winMatrix: {},
    });

    tournament = await tournamentRepository.create(
      {
        name: 'Bracket Test',
        gameTypeId: gameType.id,
        tournamentType: 'single_elimination',
        bestOfN: 3,
      },
      organizer.id
    );
  });

  describe('generateBracket', () => {
    it('should generate bracket for tournament', async () => {
      // Add some entries
      const user1 = await new UserRepository(prisma).create({
        email: 'p1@test.com',
        passwordHash: 'hash',
      });
      const user2 = await new UserRepository(prisma).create({
        email: 'p2@test.com',
        passwordHash: 'hash',
      });

      await entryRepository.create({
        tournamentId: tournament.id,
        playerId: user1.id,
        seed: 1,
      });

      await entryRepository.create({
        tournamentId: tournament.id,
        playerId: user2.id,
        seed: 2,
      });

      await bracketService.generateBracket(tournament.id);

      const updated = await tournamentRepository.findById(tournament.id);
      expect(updated?.bracketData).toBeDefined();
    });
  });

  describe('getBracket', () => {
    it('should get tournament bracket', async () => {
      const bracket = await bracketService.getBracket(tournament.id);

      expect(bracket).toBeDefined();
      expect(bracket.tournamentId).toBe(tournament.id);
      expect(bracket.rounds).toBeDefined();
    });
  });

  describe('startTournament', () => {
    it('should start tournament', async () => {
      const started = await bracketService.startTournament(tournament.id, organizer.id);

      expect(started.status).toBe(TournamentStatus.IN_PROGRESS);
    });

    it('should throw error if not organizer', async () => {
      await expect(
        bracketService.startTournament(tournament.id, 'not-organizer')
      ).rejects.toThrow();
    });
  });

  describe('advanceRound', () => {
    it('should advance tournament to next round', async () => {
      await tournamentRepository.update(tournament.id, {
        status: TournamentStatus.IN_PROGRESS,
        currentRound: 1,
      });

      await bracketService.advanceRound(tournament.id, organizer.id);

      const updated = await tournamentRepository.findById(tournament.id);
      expect(updated?.currentRound).toBe(2);
    });
  });
});

