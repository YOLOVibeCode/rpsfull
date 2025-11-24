/**
 * TDD: Tests for RoundRepository
 */

import { PrismaClient } from '@prisma/client';
import { RoundRepository } from '../RoundRepository';
import { IRoundCreate, RoundResult } from '@rpsfull-platform/contracts';
import { MatchRepository } from '../MatchRepository';
import { PlayerRepository } from '../PlayerRepository';
import { GameTypeRepository } from '../GameTypeRepository';
import { UserRepository } from '../UserRepository';

describe('RoundRepository - Complete Coverage', () => {
  let prisma: PrismaClient;
  let repository: RoundRepository;
  let matchRepository: MatchRepository;
  let playerRepository: PlayerRepository;
  let gameTypeRepository: GameTypeRepository;
  let userRepository: UserRepository;
  let match: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new RoundRepository(prisma);
    matchRepository = new MatchRepository(prisma);
    playerRepository = new PlayerRepository(prisma);
    gameTypeRepository = new GameTypeRepository(prisma);
    userRepository = new UserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.round.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    const user1 = await userRepository.create({
      email: 'p1@test.com',
      passwordHash: 'hash',
    });
    const user2 = await userRepository.create({
      email: 'p2@test.com',
      passwordHash: 'hash',
    });

    const player1 = await playerRepository.create({
      userId: user1.id,
      name: 'Player 1',
      email: 'p1@test.com',
    });

    const player2 = await playerRepository.create({
      userId: user2.id,
      name: 'Player 2',
      email: 'p2@test.com',
    });

    const gameType = await gameTypeRepository.create({
      name: 'Test RPS',
      symbolCount: 3,
      symbols: [],
      winMatrix: {},
    });

    match = await matchRepository.create({
      player1Id: player1.id,
      player2Id: player2.id,
      gameTypeId: gameType.id,
      bestOfN: 3,
      playMode: 'digital',
    });
  });

  describe('create', () => {
    it('should create a new round', async () => {
      const data: IRoundCreate = {
        matchId: match.id,
        roundNumber: 1,
        player1Move: 'rock',
        player2Move: 'paper',
        result: RoundResult.PLAYER2_WIN,
        winnerId: match.player2Id,
      };

      const round = await repository.create(data);

      expect(round).toBeDefined();
      expect(round.id).toBeDefined();
      expect(round.matchId).toBe(match.id);
      expect(round.roundNumber).toBe(1);
      expect(round.result).toBe(RoundResult.PLAYER2_WIN);
    });
  });

  describe('findById', () => {
    it('should find round by ID', async () => {
      const created = await repository.create({
        matchId: match.id,
        roundNumber: 1,
        result: RoundResult.TIE,
      });

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });
  });

  describe('findByMatchId', () => {
    it('should find all rounds for a match', async () => {
      await repository.create({
        matchId: match.id,
        roundNumber: 1,
        result: RoundResult.TIE,
      });

      await repository.create({
        matchId: match.id,
        roundNumber: 2,
        result: RoundResult.PLAYER1_WIN,
      });

      const rounds = await repository.findByMatchId(match.id);

      expect(rounds.length).toBe(2);
      expect(rounds[0].roundNumber).toBe(1);
      expect(rounds[1].roundNumber).toBe(2);
    });

    it('should return rounds sorted by round number', async () => {
      await repository.create({
        matchId: match.id,
        roundNumber: 3,
        result: RoundResult.TIE,
      });

      await repository.create({
        matchId: match.id,
        roundNumber: 1,
        result: RoundResult.TIE,
      });

      const rounds = await repository.findByMatchId(match.id);

      expect(rounds[0].roundNumber).toBe(1);
      expect(rounds[1].roundNumber).toBe(3);
    });
  });

  describe('findByMatchAndRound', () => {
    it('should find round by match and round number', async () => {
      await repository.create({
        matchId: match.id,
        roundNumber: 2,
        result: RoundResult.TIE,
      });

      const found = await repository.findByMatchAndRound(match.id, 2);

      expect(found).toBeDefined();
      expect(found?.roundNumber).toBe(2);
    });

    it('should return null if round not found', async () => {
      const found = await repository.findByMatchAndRound(match.id, 999);

      expect(found).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete round', async () => {
      const created = await repository.create({
        matchId: match.id,
        roundNumber: 1,
        result: RoundResult.TIE,
      });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});

