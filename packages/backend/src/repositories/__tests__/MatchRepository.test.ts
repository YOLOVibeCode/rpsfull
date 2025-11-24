/**
 * TDD: Tests for MatchRepository
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import { PrismaClient } from '@prisma/client';
import { MatchRepository } from '../MatchRepository';
import { IMatchCreate, IMatchUpdate, MatchStatus, PlayMode } from '@rpsfull-platform/contracts';
import { UserRepository } from '../UserRepository';
import { PlayerRepository } from '../PlayerRepository';
import { GameTypeRepository } from '../GameTypeRepository';

describe('MatchRepository - Complete Coverage', () => {
  let prisma: PrismaClient;
  let repository: MatchRepository;
  let userRepository: UserRepository;
  let playerRepository: PlayerRepository;
  let gameTypeRepository: GameTypeRepository;
  let player1: any;
  let player2: any;
  let gameType: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new MatchRepository(prisma);
    userRepository = new UserRepository(prisma);
    playerRepository = new PlayerRepository(prisma);
    gameTypeRepository = new GameTypeRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.match.deleteMany({});
    await prisma.round.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test data
    const user1 = await userRepository.create({
      email: 'player1@test.com',
      passwordHash: 'hash',
    });
    const user2 = await userRepository.create({
      email: 'player2@test.com',
      passwordHash: 'hash',
    });

    player1 = await playerRepository.create({
      userId: user1.id,
      name: 'Player 1',
      email: 'player1@test.com',
    });

    player2 = await playerRepository.create({
      userId: user2.id,
      name: 'Player 2',
      email: 'player2@test.com',
    });

    gameType = await gameTypeRepository.create({
      name: 'Test RPS',
      symbolCount: 3,
      symbols: [
        { id: 'rock', name: 'Rock', emoji: '🪨' },
        { id: 'paper', name: 'Paper', emoji: '📄' },
        { id: 'scissors', name: 'Scissors', emoji: '✂️' },
      ],
      winMatrix: {
        rock: ['scissors'],
        paper: ['rock'],
        scissors: ['paper'],
      },
    });
  });

  describe('create', () => {
    it('should create a new match', async () => {
      const data: IMatchCreate = {
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      };

      const match = await repository.create(data);

      expect(match).toBeDefined();
      expect(match.id).toBeDefined();
      expect(match.player1Id).toBe(player1.id);
      expect(match.player2Id).toBe(player2.id);
      expect(match.gameTypeId).toBe(gameType.id);
      expect(match.bestOfN).toBe(3);
      expect(match.playMode).toBe(PlayMode.DIGITAL);
      expect(match.status).toBe(MatchStatus.PENDING);
      expect(match.player1Score).toBe(0);
      expect(match.player2Score).toBe(0);
    });

    it('should create match with optional tournamentId', async () => {
      const data: IMatchCreate = {
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 5,
        playMode: PlayMode.DIGITAL,
        tournamentId: 'tournament-123',
      };

      const match = await repository.create(data);

      expect(match.tournamentId).toBe('tournament-123');
    });
  });

  describe('findById', () => {
    it('should find match by ID', async () => {
      const created = await repository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should return null for non-existent ID', async () => {
      const found = await repository.findById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('findByPlayerId', () => {
    it('should find matches for player1', async () => {
      await repository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      const matches = await repository.findByPlayerId(player1.id);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some(m => m.player1Id === player1.id || m.player2Id === player1.id)).toBe(true);
    });

    it('should filter by status', async () => {
      const match1 = await repository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      await repository.update(match1.id, { status: MatchStatus.COMPLETED });

      await repository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      const completed = await repository.findByPlayerId(player1.id, {
        status: MatchStatus.COMPLETED,
      });

      expect(completed.length).toBe(1);
      expect(completed[0].status).toBe(MatchStatus.COMPLETED);
    });
  });

  describe('findByTournamentId', () => {
    it('should find matches for tournament', async () => {
      const tournamentId = 'tournament-123';

      await repository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
        tournamentId,
      });

      const matches = await repository.findByTournamentId(tournamentId);

      expect(matches.length).toBeGreaterThan(0);
      expect(matches.every(m => m.tournamentId === tournamentId)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update match', async () => {
      const created = await repository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      const updates: IMatchUpdate = {
        status: MatchStatus.IN_PROGRESS,
        player1Score: 1,
        startedAt: new Date(),
      };

      const updated = await repository.update(created.id, updates);

      expect(updated.status).toBe(MatchStatus.IN_PROGRESS);
      expect(updated.player1Score).toBe(1);
      expect(updated.startedAt).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete match', async () => {
      const created = await repository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});

