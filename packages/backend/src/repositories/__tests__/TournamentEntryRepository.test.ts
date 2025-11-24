/**
 * TDD: Tests for TournamentEntryRepository
 */

import { PrismaClient } from '@prisma/client';
import { TournamentEntryRepository } from '../TournamentEntryRepository';
import { ITournamentEntryCreate, ITournamentEntryUpdate, TournamentEntryStatus } from '@rpsfull-platform/contracts';
import { TournamentRepository } from '../TournamentRepository';
import { PlayerRepository } from '../PlayerRepository';
import { GameTypeRepository } from '../GameTypeRepository';
import { UserRepository } from '../UserRepository';

describe('TournamentEntryRepository - Complete Coverage', () => {
  let prisma: PrismaClient;
  let repository: TournamentEntryRepository;
  let tournamentRepository: TournamentRepository;
  let playerRepository: PlayerRepository;
  let gameTypeRepository: GameTypeRepository;
  let userRepository: UserRepository;
  let tournament: any;
  let player: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new TournamentEntryRepository(prisma);
    tournamentRepository = new TournamentRepository(prisma);
    playerRepository = new PlayerRepository(prisma);
    gameTypeRepository = new GameTypeRepository(prisma);
    userRepository = new UserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.tournamentEntry.deleteMany({});
    await prisma.tournament.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    const organizer = await userRepository.create({
      email: 'organizer@test.com',
      passwordHash: 'hash',
    });

    const gameType = await gameTypeRepository.create({
      name: 'Test RPS',
      symbolCount: 3,
      symbols: [],
      winMatrix: {},
    });

    tournament = await tournamentRepository.create(
      {
        name: 'Test Tournament',
        gameTypeId: gameType.id,
        tournamentType: 'single_elimination',
        bestOfN: 3,
      },
      organizer.id
    );

    const user = await userRepository.create({
      email: 'player@test.com',
      passwordHash: 'hash',
    });

    player = await playerRepository.create({
      userId: user.id,
      name: 'Test Player',
      email: 'player@test.com',
    });
  });

  describe('create', () => {
    it('should create a new tournament entry', async () => {
      const data: ITournamentEntryCreate = {
        tournamentId: tournament.id,
        playerId: player.id,
        seed: 1,
      };

      const entry = await repository.create(data);

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.tournamentId).toBe(tournament.id);
      expect(entry.playerId).toBe(player.id);
      expect(entry.seed).toBe(1);
      expect(entry.status).toBe(TournamentEntryStatus.REGISTERED);
      expect(entry.matchesWon).toBe(0);
      expect(entry.matchesLost).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find entry by ID', async () => {
      const created = await repository.create({
        tournamentId: tournament.id,
        playerId: player.id,
      });

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });
  });

  describe('findByTournamentAndPlayer', () => {
    it('should find entry by tournament and player', async () => {
      await repository.create({
        tournamentId: tournament.id,
        playerId: player.id,
      });

      const found = await repository.findByTournamentAndPlayer(tournament.id, player.id);

      expect(found).toBeDefined();
      expect(found?.tournamentId).toBe(tournament.id);
      expect(found?.playerId).toBe(player.id);
    });
  });

  describe('findByTournamentId', () => {
    it('should find all entries for a tournament', async () => {
      const player2 = await playerRepository.create({
        name: 'Player 2',
        email: 'player2@test.com',
      });

      await repository.create({
        tournamentId: tournament.id,
        playerId: player.id,
      });

      await repository.create({
        tournamentId: tournament.id,
        playerId: player2.id,
      });

      const entries = await repository.findByTournamentId(tournament.id);

      expect(entries.length).toBe(2);
    });
  });

  describe('findByStatus', () => {
    it('should find entries by status', async () => {
      const entry = await repository.create({
        tournamentId: tournament.id,
        playerId: player.id,
      });

      await repository.update(entry.id, { status: TournamentEntryStatus.ACTIVE });

      const active = await repository.findByStatus(tournament.id, TournamentEntryStatus.ACTIVE);

      expect(active.length).toBe(1);
      expect(active[0].status).toBe(TournamentEntryStatus.ACTIVE);
    });
  });

  describe('update', () => {
    it('should update entry', async () => {
      const created = await repository.create({
        tournamentId: tournament.id,
        playerId: player.id,
      });

      const updates: ITournamentEntryUpdate = {
        status: TournamentEntryStatus.ACTIVE,
        matchesWon: 2,
        matchesLost: 1,
      };

      const updated = await repository.update(created.id, updates);

      expect(updated.status).toBe(TournamentEntryStatus.ACTIVE);
      expect(updated.matchesWon).toBe(2);
      expect(updated.matchesLost).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete entry', async () => {
      const created = await repository.create({
        tournamentId: tournament.id,
        playerId: player.id,
      });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});

