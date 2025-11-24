/**
 * TDD: Tests for PlayerStatisticsRepository
 */

import { PrismaClient } from '@prisma/client';
import { PlayerStatisticsRepository } from '../PlayerStatisticsRepository';
import { IPlayerStatisticsUpdate } from '@rpsfull-platform/contracts';
import { PlayerRepository } from '../PlayerRepository';
import { GameTypeRepository } from '../GameTypeRepository';
import { UserRepository } from '../UserRepository';

describe('PlayerStatisticsRepository - Complete Coverage', () => {
  let prisma: PrismaClient;
  let repository: PlayerStatisticsRepository;
  let playerRepository: PlayerRepository;
  let gameTypeRepository: GameTypeRepository;
  let userRepository: UserRepository;
  let player: any;
  let gameType: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PlayerStatisticsRepository(prisma);
    playerRepository = new PlayerRepository(prisma);
    gameTypeRepository = new GameTypeRepository(prisma);
    userRepository = new UserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.playerStatistics.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    const user = await userRepository.create({
      email: 'player@test.com',
      passwordHash: 'hash',
    });

    player = await playerRepository.create({
      userId: user.id,
      name: 'Test Player',
      email: 'player@test.com',
    });

    gameType = await gameTypeRepository.create({
      name: 'Test RPS',
      symbolCount: 3,
      symbols: [],
      winMatrix: {},
    });
  });

  describe('upsert', () => {
    it('should create statistics if not exists', async () => {
      const data: IPlayerStatisticsUpdate = {
        totalMatches: 10,
        matchesWon: 7,
        matchesLost: 3,
        winRate: 0.7,
      };

      const stats = await repository.upsert(player.id, gameType.id, data);

      expect(stats).toBeDefined();
      expect(stats.playerId).toBe(player.id);
      expect(stats.gameTypeId).toBe(gameType.id);
      expect(stats.totalMatches).toBe(10);
      expect(stats.matchesWon).toBe(7);
      expect(stats.winRate).toBe(0.7);
    });

    it('should update statistics if exists', async () => {
      await repository.upsert(player.id, gameType.id, {
        totalMatches: 5,
        matchesWon: 3,
      });

      const updated = await repository.upsert(player.id, gameType.id, {
        totalMatches: 10,
        matchesWon: 7,
      });

      expect(updated.totalMatches).toBe(10);
      expect(updated.matchesWon).toBe(7);
    });
  });

  describe('findByPlayerAndGameType', () => {
    it('should find statistics by player and game type', async () => {
      await repository.upsert(player.id, gameType.id, {
        totalMatches: 5,
        matchesWon: 3,
      });

      const found = await repository.findByPlayerAndGameType(player.id, gameType.id);

      expect(found).toBeDefined();
      expect(found?.playerId).toBe(player.id);
      expect(found?.gameTypeId).toBe(gameType.id);
    });

    it('should return null if not found', async () => {
      const found = await repository.findByPlayerAndGameType(player.id, 'non-existent');

      expect(found).toBeNull();
    });
  });

  describe('findByPlayerId', () => {
    it('should find all statistics for a player', async () => {
      const gameType2 = await gameTypeRepository.create({
        name: 'RPS-LS',
        symbolCount: 5,
        symbols: [],
        winMatrix: {},
      });

      await repository.upsert(player.id, gameType.id, { totalMatches: 5 });
      await repository.upsert(player.id, gameType2.id, { totalMatches: 3 });

      const stats = await repository.findByPlayerId(player.id);

      expect(stats.length).toBe(2);
    });
  });

  describe('update', () => {
    it('should update statistics', async () => {
      const created = await repository.upsert(player.id, gameType.id, {
        totalMatches: 5,
        matchesWon: 3,
      });

      const updates: IPlayerStatisticsUpdate = {
        totalMatches: 10,
        matchesWon: 7,
        winRate: 0.7,
      };

      const updated = await repository.update(created.id, updates);

      expect(updated.totalMatches).toBe(10);
      expect(updated.matchesWon).toBe(7);
      expect(updated.winRate).toBe(0.7);
    });
  });

  describe('delete', () => {
    it('should delete statistics', async () => {
      const created = await repository.upsert(player.id, gameType.id, {
        totalMatches: 5,
      });

      await repository.delete(created.id);

      const found = await repository.findByPlayerAndGameType(player.id, gameType.id);
      expect(found).toBeNull();
    });
  });
});

