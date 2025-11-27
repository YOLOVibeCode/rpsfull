/**
 * TDD: Tests for GameTypeRepository
 */

import { PrismaClient } from '@prisma/client';
import { GameTypeRepository } from '../GameTypeRepository';
import { UserRepository } from '../UserRepository';
import { IGameTypeCreate, IGameTypeUpdate, TieRule, ScoringMethod } from '@rpsfull-platform/contracts';

describe('GameTypeRepository - Complete Coverage', () => {
  let prisma: PrismaClient;
  let repository: GameTypeRepository;
  let userRepository: UserRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new GameTypeRepository(prisma);
    userRepository = new UserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.gameType.deleteMany({});
  });

  describe('create', () => {
    it('should create a new game type', async () => {
      const data: IGameTypeCreate = {
        name: 'Test RPS',
        description: 'Test game',
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
        tieRules: TieRule.REPLAY,
        scoringMethod: ScoringMethod.BEST_OF_N,
      };

      const gameType = await repository.create(data);

      expect(gameType).toBeDefined();
      expect(gameType.id).toBeDefined();
      expect(gameType.name).toBe('Test RPS');
      expect(gameType.symbolCount).toBe(3);
      expect(gameType.isActive).toBe(true);
    });
  });

  describe('findById', () => {
    it('should find game type by ID', async () => {
      const created = await repository.create({
        name: 'Find Test',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
      });

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });
  });

  describe('findDefault', () => {
    it('should find default game type', async () => {
      await repository.create({
        name: 'Not Default',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
        isDefault: false,
      });

      const defaultGame = await repository.create({
        name: 'Default Game',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
        isDefault: true,
      });

      const found = await repository.findDefault();

      expect(found).toBeDefined();
      expect(found?.id).toBe(defaultGame.id);
    });
  });

  describe('findActive', () => {
    it('should find only active game types', async () => {
      await repository.create({
        name: 'Active Game',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
        isActive: true,
      });

      await repository.create({
        name: 'Inactive Game',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
        isActive: false,
      });

      const active = await repository.findActive();

      expect(active.length).toBeGreaterThan(0);
      expect(active.every(gt => gt.isActive)).toBe(true);
    });
  });

  describe('searchByName', () => {
    it('should search game types by name', async () => {
      await repository.create({
        name: 'Rock Paper Scissors',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
      });

      const results = await repository.searchByName('Rock');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(gt => gt.name.includes('Rock'))).toBe(true);
    });
  });

  describe('update', () => {
    it('should update game type', async () => {
      const created = await repository.create({
        name: 'Update Test',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
      });

      const updates: IGameTypeUpdate = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const updated = await repository.update(created.id, updates);

      expect(updated.name).toBe('Updated Name');
      expect(updated.description).toBe('Updated description');
    });
  });

  describe('delete', () => {
    it('should delete game type', async () => {
      const created = await repository.create({
        name: 'Delete Test',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
      });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('findByCreator', () => {
    it('should find game types created by specific user', async () => {
      const user1 = await userRepository.create({
        username: 'user1',
        email: 'user1@test.com',
        passwordHash: 'hash',
      });

      const user2 = await userRepository.create({
        username: 'user2',
        email: 'user2@test.com',
        passwordHash: 'hash',
      });

      await repository.create({
        name: 'User1 Game',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
        createdBy: user1.id,
      } as IGameTypeCreate & { createdBy: string });

      await repository.create({
        name: 'User2 Game',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
        createdBy: user2.id,
      } as IGameTypeCreate & { createdBy: string });

      const user1Games = await repository.findByCreator(user1.id);

      expect(user1Games.length).toBe(1);
      expect(user1Games[0].name).toBe('User1 Game');
    });

    it('should return empty array if user has no games', async () => {
      const user = await userRepository.create({
        username: 'nogames',
        email: 'nogames@test.com',
        passwordHash: 'hash',
      });

      const games = await repository.findByCreator(user.id);

      expect(games).toEqual([]);
    });
  });
});

