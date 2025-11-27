/**
 * TDD: Tests for Game Type Routes
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import { PrismaClient } from '@prisma/client';
import { GameTypeRepository } from '../../repositories/GameTypeRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { IGameTypeCreate, IGameTypeUpdate, TieRule, ScoringMethod } from '@rpsfull-platform/contracts';

describe('Game Type Routes - Update Endpoint', () => {
  let prisma: PrismaClient;
  let gameTypeRepository: GameTypeRepository;
  let userRepository: UserRepository;
  let creatorId: string;
  let otherUserId: string;
  let gameTypeId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    gameTypeRepository = new GameTypeRepository(prisma);
    userRepository = new UserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test users
    const creator = await userRepository.create({
      username: 'creator',
      email: 'creator@test.com',
      passwordHash: 'hash',
    });
    creatorId = creator.id;

    const otherUser = await userRepository.create({
      username: 'other',
      email: 'other@test.com',
      passwordHash: 'hash',
    });
    otherUserId = otherUser.id;

    // Create test game type
    const gameType = await gameTypeRepository.create({
      name: 'Test Game',
      description: 'Original description',
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
      createdBy: creatorId,
    } as IGameTypeCreate & { createdBy: string });
    gameTypeId = gameType.id;
  });

  describe('PATCH /api/v1/game-types/:id', () => {
    it('should update game type name', async () => {
      const updateData: IGameTypeUpdate = {
        name: 'Updated Game Name',
      };

      const updated = await gameTypeRepository.update(gameTypeId, updateData);

      expect(updated.name).toBe('Updated Game Name');
      expect(updated.description).toBe('Original description'); // Should remain unchanged
    });

    it('should update game type description', async () => {
      const updateData: IGameTypeUpdate = {
        description: 'Updated description',
      };

      const updated = await gameTypeRepository.update(gameTypeId, updateData);

      expect(updated.description).toBe('Updated description');
      expect(updated.name).toBe('Test Game'); // Should remain unchanged
    });

    it('should update symbols and recalculate symbolCount', async () => {
      const newSymbols = [
        { id: 'rock', name: 'Rock', emoji: '🪨' },
        { id: 'paper', name: 'Paper', emoji: '📄' },
        { id: 'scissors', name: 'Scissors', emoji: '✂️' },
        { id: 'lizard', name: 'Lizard', emoji: '🦎' },
        { id: 'spock', name: 'Spock', emoji: '🖖' },
      ];

      const updateData: IGameTypeUpdate = {
        symbols: newSymbols,
      };

      const updated = await gameTypeRepository.update(gameTypeId, updateData);

      expect(updated.symbolCount).toBe(5);
      expect(updated.symbols).toHaveLength(5);
    });

    it('should update win matrix', async () => {
      const newWinMatrix = {
        rock: ['scissors', 'lizard'],
        paper: ['rock', 'spock'],
        scissors: ['paper', 'lizard'],
      };

      const updateData: IGameTypeUpdate = {
        winMatrix: newWinMatrix,
      };

      const updated = await gameTypeRepository.update(gameTypeId, updateData);

      expect(updated.winMatrix).toEqual(newWinMatrix);
    });

    it('should update multiple fields at once', async () => {
      const updateData: IGameTypeUpdate = {
        name: 'Fully Updated Game',
        description: 'New description',
        tieRules: TieRule.RANDOM,
        scoringMethod: ScoringMethod.FIRST_TO_N,
      };

      const updated = await gameTypeRepository.update(gameTypeId, updateData);

      expect(updated.name).toBe('Fully Updated Game');
      expect(updated.description).toBe('New description');
      expect(updated.tieRules).toBe(TieRule.RANDOM);
      expect(updated.scoringMethod).toBe(ScoringMethod.FIRST_TO_N);
    });

    it('should throw error for non-existent game type', async () => {
      const updateData: IGameTypeUpdate = {
        name: 'Updated Name',
      };

      await expect(
        gameTypeRepository.update('non-existent-id', updateData)
      ).rejects.toThrow();
    });

    it('should handle partial updates correctly', async () => {
      // First update name
      await gameTypeRepository.update(gameTypeId, { name: 'First Update' });
      
      // Then update description only
      const updated = await gameTypeRepository.update(gameTypeId, { description: 'Second Update' });

      expect(updated.name).toBe('First Update'); // Should persist
      expect(updated.description).toBe('Second Update'); // Should be updated
    });
  });

  describe('GET /api/v1/game-types with search', () => {
    it('should find games by name using searchByName', async () => {
      await repository.create({
        name: 'Rock Paper Scissors',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
      });

      await repository.create({
        name: 'Lizard Spock',
        symbolCount: 5,
        symbols: [],
        winMatrix: {},
      });

      // Test searchByName repository method
      const results = await repository.searchByName('Rock');

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(gt => gt.name.includes('Rock'))).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const results = await repository.searchByName('NonExistentGame');

      expect(results).toEqual([]);
    });

    it('should be case-insensitive', async () => {
      await repository.create({
        name: 'Rock Paper Scissors',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
      });

      const results1 = await repository.searchByName('rock');
      const results2 = await repository.searchByName('ROCK');
      const results3 = await repository.searchByName('Rock');

      expect(results1.length).toBeGreaterThan(0);
      expect(results2.length).toBeGreaterThan(0);
      expect(results3.length).toBeGreaterThan(0);
    });
  });
});

