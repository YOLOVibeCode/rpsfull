/**
 * TDD: Tests for StatisticsCalculationService
 * 
 * ISP: Separated calculation operations
 */

import { PrismaClient } from '@prisma/client';
import { StatisticsCalculationService } from '../StatisticsCalculationService';
import { PlayerStatisticsRepository } from '../../repositories/PlayerStatisticsRepository';
import { MatchRepository } from '../../repositories/MatchRepository';
import { RoundRepository } from '../../repositories/RoundRepository';
import { PlayerRepository } from '../../repositories/PlayerRepository';
import { GameTypeRepository } from '../../repositories/GameTypeRepository';
import { UserRepository } from '../../repositories/UserRepository';

describe('StatisticsCalculationService - Complete Coverage', () => {
  let prisma: PrismaClient;
  let statisticsRepository: PlayerStatisticsRepository;
  let matchRepository: MatchRepository;
  let roundRepository: RoundRepository;
  let calculationService: StatisticsCalculationService;
  let player: any;
  let gameType: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    statisticsRepository = new PlayerStatisticsRepository(prisma);
    matchRepository = new MatchRepository(prisma);
    roundRepository = new RoundRepository(prisma);
    calculationService = new StatisticsCalculationService(
      statisticsRepository,
      matchRepository,
      roundRepository
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.round.deleteMany({});
    await prisma.match.deleteMany({});
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

  describe('calculatePlayerStatistics', () => {
    it('should calculate statistics for player', async () => {
      const stats = await calculationService.calculatePlayerStatistics(player.id, gameType.id);

      expect(stats).toBeDefined();
      expect(stats.playerId).toBe(player.id);
      expect(stats.gameTypeId).toBe(gameType.id);
    });
  });

  describe('updateStatisticsAfterMatch', () => {
    it('should update statistics after match completion', async () => {
      const player2 = await new PlayerRepository(prisma).create({
        name: 'Player 2',
        email: 'player2@test.com',
      });

      const match = await matchRepository.create({
        player1Id: player.id,
        player2Id: player2.id,
        gameTypeId: gameType.id,
        bestOfN: 3,
        playMode: 'digital',
      });

      await matchRepository.update(match.id, {
        status: 'completed',
        winnerId: player.id,
        player1Score: 2,
        player2Score: 1,
      });

      await calculationService.updateStatisticsAfterMatch(match.id);

      const stats = await statisticsRepository.findByPlayerAndGameType(player.id, gameType.id);
      expect(stats).toBeDefined();
    });
  });

  describe('recalculatePlayerStatistics', () => {
    it('should recalculate all statistics for player', async () => {
      await calculationService.recalculatePlayerStatistics(player.id);

      const stats = await statisticsRepository.findByPlayerId(player.id);
      expect(stats).toBeDefined();
    });
  });
});

