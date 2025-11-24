/**
 * TDD: Tests for TournamentRepository
 */

import { PrismaClient } from '@prisma/client';
import { TournamentRepository } from '../TournamentRepository';
import { ITournamentCreate, ITournamentUpdate, TournamentType, TournamentStatus } from '@rpsfull-platform/contracts';
import { UserRepository } from '../UserRepository';
import { GameTypeRepository } from '../GameTypeRepository';

describe('TournamentRepository - Complete Coverage', () => {
  let prisma: PrismaClient;
  let repository: TournamentRepository;
  let userRepository: UserRepository;
  let gameTypeRepository: GameTypeRepository;
  let organizer: any;
  let gameType: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new TournamentRepository(prisma);
    userRepository = new UserRepository(prisma);
    gameTypeRepository = new GameTypeRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.tournament.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    organizer = await userRepository.create({
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

  describe('create', () => {
    it('should create a new tournament', async () => {
      const data: ITournamentCreate = {
        name: 'Test Tournament',
        description: 'Test description',
        gameTypeId: gameType.id,
        tournamentType: TournamentType.SINGLE_ELIMINATION,
        bestOfN: 3,
        maxParticipants: 16,
      };

      const tournament = await repository.create(data, organizer.id);

      expect(tournament).toBeDefined();
      expect(tournament.id).toBeDefined();
      expect(tournament.name).toBe('Test Tournament');
      expect(tournament.organizerId).toBe(organizer.id);
      expect(tournament.tournamentType).toBe(TournamentType.SINGLE_ELIMINATION);
      expect(tournament.status).toBe(TournamentStatus.DRAFT);
      expect(tournament.participantCount).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find tournament by ID', async () => {
      const created = await repository.create(
        {
          name: 'Find Test',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });
  });

  describe('findByOrganizerId', () => {
    it('should find tournaments by organizer', async () => {
      await repository.create(
        {
          name: 'Tournament 1',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      const tournaments = await repository.findByOrganizerId(organizer.id);

      expect(tournaments.length).toBeGreaterThan(0);
      expect(tournaments.every(t => t.organizerId === organizer.id)).toBe(true);
    });
  });

  describe('findByStatus', () => {
    it('should find tournaments by status', async () => {
      const t1 = await repository.create(
        {
          name: 'Draft Tournament',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      await repository.update(t1.id, { status: TournamentStatus.REGISTRATION });

      await repository.create(
        {
          name: 'Another Draft',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      const registration = await repository.findByStatus(TournamentStatus.REGISTRATION);

      expect(registration.length).toBe(1);
      expect(registration[0].status).toBe(TournamentStatus.REGISTRATION);
    });
  });

  describe('findAll', () => {
    it('should find all tournaments', async () => {
      await repository.create(
        {
          name: 'Tournament 1',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      const all = await repository.findAll();

      expect(all.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const t1 = await repository.create(
        {
          name: 'Filter Test',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      await repository.update(t1.id, { status: TournamentStatus.IN_PROGRESS });

      const inProgress = await repository.findAll({ status: TournamentStatus.IN_PROGRESS });

      expect(inProgress.length).toBe(1);
      expect(inProgress[0].status).toBe(TournamentStatus.IN_PROGRESS);
    });
  });

  describe('update', () => {
    it('should update tournament', async () => {
      const created = await repository.create(
        {
          name: 'Update Test',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      const updates: ITournamentUpdate = {
        name: 'Updated Name',
        status: TournamentStatus.REGISTRATION,
        currentRound: 1,
      };

      const updated = await repository.update(created.id, updates);

      expect(updated.name).toBe('Updated Name');
      expect(updated.status).toBe(TournamentStatus.REGISTRATION);
      expect(updated.currentRound).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete tournament', async () => {
      const created = await repository.create(
        {
          name: 'Delete Test',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});

