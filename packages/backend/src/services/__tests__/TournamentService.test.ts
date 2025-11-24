/**
 * TDD: Tests for TournamentService
 */

import { PrismaClient } from '@prisma/client';
import { TournamentService } from '../TournamentService';
import { TournamentRepository } from '../../repositories/TournamentRepository';
import { GameTypeRepository } from '../../repositories/GameTypeRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { ICreateTournamentDto, TournamentType, TournamentStatus } from '@rpsfull-platform/contracts';

describe('TournamentService - Complete Coverage', () => {
  let prisma: PrismaClient;
  let tournamentRepository: TournamentRepository;
  let gameTypeRepository: GameTypeRepository;
  let tournamentService: TournamentService;
  let organizer: any;
  let gameType: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    tournamentRepository = new TournamentRepository(prisma);
    gameTypeRepository = new GameTypeRepository(prisma);
    tournamentService = new TournamentService(tournamentRepository, gameTypeRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.tournament.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    organizer = await new UserRepository(prisma).create({
      email: 'organizer@test.com',
      passwordHash: 'hash',
    });

    gameType = await gameTypeRepository.create({
      name: 'Test RPS',
      symbolCount: 3,
      symbols: [],
      winMatrix: {},
    });
  });

  describe('createTournament', () => {
    it('should create a new tournament', async () => {
      const data: ICreateTournamentDto = {
        name: 'Test Tournament',
        description: 'Test description',
        gameTypeId: gameType.id,
        tournamentType: TournamentType.SINGLE_ELIMINATION,
        bestOfN: 3,
        maxParticipants: 16,
      };

      const tournament = await tournamentService.createTournament(data, organizer.id);

      expect(tournament).toBeDefined();
      expect(tournament.name).toBe('Test Tournament');
      expect(tournament.organizerId).toBe(organizer.id);
      expect(tournament.tournamentType).toBe(TournamentType.SINGLE_ELIMINATION);
    });

    it('should throw error if game type not found', async () => {
      const data: ICreateTournamentDto = {
        name: 'Test',
        gameTypeId: 'non-existent',
        tournamentType: TournamentType.SINGLE_ELIMINATION,
        bestOfN: 3,
      };

      await expect(
        tournamentService.createTournament(data, organizer.id)
      ).rejects.toThrow();
    });
  });

  describe('getTournamentById', () => {
    it('should get tournament with details', async () => {
      const created = await tournamentRepository.create(
        {
          name: 'Get Test',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      const result = await tournamentService.getTournamentById(created.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(created.id);
      expect(result.gameType).toBeDefined();
    });
  });

  describe('getTournaments', () => {
    it('should get tournaments list', async () => {
      await tournamentRepository.create(
        {
          name: 'Tournament 1',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      const tournaments = await tournamentService.getTournaments();

      expect(tournaments.length).toBeGreaterThan(0);
    });
  });

  describe('updateTournament', () => {
    it('should update tournament', async () => {
      const created = await tournamentRepository.create(
        {
          name: 'Update Test',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      const updated = await tournamentService.updateTournament(
        created.id,
        { name: 'Updated Name' },
        organizer.id
      );

      expect(updated.name).toBe('Updated Name');
    });

    it('should throw error if not organizer', async () => {
      const created = await tournamentRepository.create(
        {
          name: 'Test',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      await expect(
        tournamentService.updateTournament(created.id, { name: 'Updated' }, 'not-organizer')
      ).rejects.toThrow();
    });
  });

  describe('deleteTournament', () => {
    it('should delete tournament', async () => {
      const created = await tournamentRepository.create(
        {
          name: 'Delete Test',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      await tournamentService.deleteTournament(created.id, organizer.id);

      const found = await tournamentRepository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});

