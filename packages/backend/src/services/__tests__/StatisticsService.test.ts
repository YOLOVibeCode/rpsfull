/**
 * TDD: Tests for StatisticsService
 */

import { PrismaClient } from '@prisma/client';
import { StatisticsService } from '../StatisticsService';
import { PlayerStatisticsRepository } from '../../repositories/PlayerStatisticsRepository';
import { PlayerRepository } from '../../repositories/PlayerRepository';
import { GameTypeRepository } from '../../repositories/GameTypeRepository';
import { UserRepository } from '../../repositories/UserRepository';

describe('StatisticsService - Complete Coverage', () => {
  let prisma: PrismaClient;
  let statisticsRepository: PlayerStatisticsRepository;
  let statisticsService: StatisticsService;
  let player: any;
  let gameType: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    statisticsRepository = new PlayerStatisticsRepository(prisma);
    statisticsService = new StatisticsService(statisticsRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.playerStatistics.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    const user = await new UserRepository(prisma).create({
      email: 'player@test.com',
      passwordHash: 'hash',
    });

    player = await new PlayerRepository(prisma).create({
      userId: user.id,
      name: 'Test Player',
      email: 'player@test.com',
    });

    gameType = await new GameTypeRepository(prisma).create({
      name: 'Test RPS',
      symbolCount: 3,
      symbols: [],
      winMatrix: {},
    });
  });

  describe('getPlayerStatistics', () => {
    it('should get player statistics', async () => {
      await statisticsRepository.upsert(player.id, gameType.id, {
        totalMatches: 10,
        matchesWon: 7,
        matchesLost: 3,
        winRate: 0.7,
      });

      const result = await statisticsService.getPlayerStatistics(player.id, gameType.id);

      expect(result).toBeDefined();
      expect(result.statistics.totalMatches).toBe(10);
      expect(result.statistics.winRate).toBe(0.7);
    });

    it('should return empty statistics if not found', async () => {
      const result = await statisticsService.getPlayerStatistics(player.id, gameType.id);

      expect(result).toBeDefined();
      expect(result.statistics.totalMatches).toBe(0);
    });
  });

  describe('getHeadToHeadStats', () => {
    it('should get head-to-head statistics', async () => {
      const player2 = await new PlayerRepository(prisma).create({
        name: 'Player 2',
        email: 'player2@test.com',
      });

      const result = await statisticsService.getHeadToHeadStats(
        player.id,
        player2.id,
        gameType.id
      );

      expect(result).toBeDefined();
      expect(result.player1Id).toBe(player.id);
      expect(result.player2Id).toBe(player2.id);
    });
  });

  describe('getGlobalStats', () => {
    it('should get global statistics', async () => {
      const result = await statisticsService.getGlobalStats(gameType.id);

      expect(result).toBeDefined();
      expect(result.totalPlayers).toBeDefined();
      expect(result.totalMatches).toBeDefined();
    });
  });

  describe('getLeaderboard', () => {
    it('should get leaderboard', async () => {
      const result = await statisticsService.getLeaderboard(gameType.id, {
        page: 1,
        limit: 10,
      });

      expect(result).toBeDefined();
      expect(result.entries).toBeDefined();
      expect(result.pagination).toBeDefined();
    });
  });
});

