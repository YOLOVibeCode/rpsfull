/**
 * TDD: Tests for MatchService
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import { PrismaClient } from '@prisma/client';
import { MatchService } from '../MatchService';
import { MatchRepository } from '../../repositories/MatchRepository';
import { PlayerRepository } from '../../repositories/PlayerRepository';
import { GameTypeRepository } from '../../repositories/GameTypeRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { ICreateMatchDto, PlayMode, MatchStatus } from '@rpsfull-platform/contracts';

describe('MatchService - Complete Coverage', () => {
  let prisma: PrismaClient;
  let matchRepository: MatchRepository;
  let playerRepository: PlayerRepository;
  let gameTypeRepository: GameTypeRepository;
  let matchService: MatchService;
  let player1: any;
  let player2: any;
  let gameType: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    matchRepository = new MatchRepository(prisma);
    playerRepository = new PlayerRepository(prisma);
    gameTypeRepository = new GameTypeRepository(prisma);
    matchService = new MatchService(matchRepository, playerRepository, gameTypeRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.match.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    const user1 = await new UserRepository(prisma).create({
      email: 'p1@test.com',
      passwordHash: 'hash',
    });
    const user2 = await new UserRepository(prisma).create({
      email: 'p2@test.com',
      passwordHash: 'hash',
    });

    player1 = await playerRepository.create({
      userId: user1.id,
      name: 'Player 1',
      email: 'p1@test.com',
    });

    player2 = await playerRepository.create({
      userId: user2.id,
      name: 'Player 2',
      email: 'p2@test.com',
    });

    gameType = await gameTypeRepository.create({
      name: 'Test RPS',
      symbolCount: 3,
      symbols: [],
      winMatrix: {},
    });
  });

  describe('createMatch', () => {
    it('should create a new match', async () => {
      const data: ICreateMatchDto = {
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      };

      const match = await matchService.createMatch(data, player1.id);

      expect(match).toBeDefined();
      expect(match.player1Id).toBe(player1.id);
      expect(match.player2Id).toBe(player2.id);
      expect(match.gameTypeId).toBe(gameType.id);
      expect(match.status).toBe(MatchStatus.PENDING);
    });

    it('should throw error if player2 not found', async () => {
      const data: ICreateMatchDto = {
        player2Id: 'non-existent',
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      };

      await expect(matchService.createMatch(data, player1.id)).rejects.toThrow();
    });

    it('should throw error if game type not found', async () => {
      const data: ICreateMatchDto = {
        player2Id: player2.id,
        gameTypeId: 'non-existent',
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      };

      await expect(matchService.createMatch(data, player1.id)).rejects.toThrow();
    });

    it('should prevent creating match with same player', async () => {
      const data: ICreateMatchDto = {
        player2Id: player1.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      };

      await expect(matchService.createMatch(data, player1.id)).rejects.toThrow();
    });
  });

  describe('getMatchById', () => {
    it('should get match with details', async () => {
      const match = await matchRepository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      const result = await matchService.getMatchById(match.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(match.id);
      expect(result.player1).toBeDefined();
      expect(result.player2).toBeDefined();
      expect(result.gameType).toBeDefined();
    });

    it('should throw error if match not found', async () => {
      await expect(matchService.getMatchById('non-existent')).rejects.toThrow();
    });
  });

  describe('getPlayerMatches', () => {
    it('should get matches for player', async () => {
      await matchRepository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      const matches = await matchService.getPlayerMatches(player1.id);

      expect(matches.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const match = await matchRepository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      await matchRepository.update(match.id, { status: MatchStatus.COMPLETED });

      const completed = await matchService.getPlayerMatches(player1.id, {
        status: MatchStatus.COMPLETED,
      });

      expect(completed.length).toBe(1);
    });
  });

  describe('startMatch', () => {
    it('should start a match', async () => {
      const match = await matchRepository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      const started = await matchService.startMatch(match.id, player1.id);

      expect(started.status).toBe(MatchStatus.IN_PROGRESS);
      expect(started.startedAt).toBeDefined();
    });

    it('should throw error if match not found', async () => {
      await expect(matchService.startMatch('non-existent', player1.id)).rejects.toThrow();
    });

    it('should throw error if player not participant', async () => {
      const match = await matchRepository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      await expect(matchService.startMatch(match.id, 'non-participant')).rejects.toThrow();
    });
  });

  describe('cancelMatch', () => {
    it('should cancel a match', async () => {
      const match = await matchRepository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      await matchService.cancelMatch(match.id, player1.id);

      const cancelled = await matchRepository.findById(match.id);
      expect(cancelled?.status).toBe(MatchStatus.CANCELLED);
    });

    it('should throw error if player not participant', async () => {
      const match = await matchRepository.create({
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: PlayMode.DIGITAL,
      });

      await expect(matchService.cancelMatch(match.id, 'non-participant')).rejects.toThrow();
    });
  });
});

