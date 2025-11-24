/**
 * TDD: Tests for PlayerRepository
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import { PrismaClient } from '@prisma/client';
import { PlayerRepository } from '../PlayerRepository';
import { IPlayerCreate, IPlayerUpdate } from '@rpsfull-platform/contracts';
import { UserRepository } from '../UserRepository';

describe('PlayerRepository - Complete Coverage', () => {
  let prisma: PrismaClient;
  let repository: PlayerRepository;
  let userRepository: UserRepository;

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PlayerRepository(prisma);
    userRepository = new UserRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.player.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('create', () => {
    it('should create a new player', async () => {
      const user = await userRepository.create({
        email: 'player@example.com',
        passwordHash: 'hash',
      });

      const data: IPlayerCreate = {
        userId: user.id,
        name: 'Test Player',
        email: 'player@example.com',
      };

      const player = await repository.create(data);

      expect(player).toBeDefined();
      expect(player.id).toBeDefined();
      expect(player.name).toBe('Test Player');
      expect(player.userId).toBe(user.id);
      expect(player.level).toBe(1);
      expect(player.experience).toBe(0);
      expect(player.isActive).toBe(true);
    });

    it('should create player without userId (unclaimed)', async () => {
      const data: IPlayerCreate = {
        name: 'Unclaimed Player',
        email: 'unclaimed@example.com',
      };

      const player = await repository.create(data);

      expect(player.userId).toBeNull();
      expect(player.email).toBe('unclaimed@example.com');
    });
  });

  describe('findById', () => {
    it('should find player by ID', async () => {
      const user = await userRepository.create({
        email: 'find@example.com',
        passwordHash: 'hash',
      });

      const created = await repository.create({
        userId: user.id,
        name: 'Find Player',
        email: 'find@example.com',
      });

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Find Player');
    });

    it('should return null for non-existent ID', async () => {
      const found = await repository.findById('non-existent-id');

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find player by user ID', async () => {
      const user = await userRepository.create({
        email: 'userfind@example.com',
        passwordHash: 'hash',
      });

      await repository.create({
        userId: user.id,
        name: 'User Find Player',
        email: 'userfind@example.com',
      });

      const found = await repository.findByUserId(user.id);

      expect(found).toBeDefined();
      expect(found?.userId).toBe(user.id);
    });

    it('should return null if no player for user', async () => {
      const user = await userRepository.create({
        email: 'noplayer@example.com',
        passwordHash: 'hash',
      });

      const found = await repository.findByUserId(user.id);

      expect(found).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find player by email', async () => {
      await repository.create({
        name: 'Email Player',
        email: 'emailfind@example.com',
      });

      const found = await repository.findByEmail('emailfind@example.com');

      expect(found).toBeDefined();
      expect(found?.email).toBe('emailfind@example.com');
    });
  });

  describe('searchByName', () => {
    it('should search players by name', async () => {
      await repository.create({ name: 'John Doe', email: 'john@example.com' });
      await repository.create({ name: 'Jane Smith', email: 'jane@example.com' });
      await repository.create({ name: 'Bob Johnson', email: 'bob@example.com' });

      const results = await repository.searchByName('John', 10);

      expect(results.length).toBeGreaterThan(0);
      expect(results.some(p => p.name.includes('John'))).toBe(true);
    });

    it('should respect limit parameter', async () => {
      for (let i = 0; i < 15; i++) {
        await repository.create({
          name: `Player ${i}`,
          email: `player${i}@example.com`,
        });
      }

      const results = await repository.searchByName('Player', 5);

      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('findAll', () => {
    it('should find all players with pagination', async () => {
      for (let i = 0; i < 10; i++) {
        await repository.create({
          name: `Player ${i}`,
          email: `player${i}@example.com`,
        });
      }

      const results = await repository.findAll(5, 0);

      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should respect offset parameter', async () => {
      for (let i = 0; i < 10; i++) {
        await repository.create({
          name: `Player ${i}`,
          email: `player${i}@example.com`,
        });
      }

      const firstPage = await repository.findAll(5, 0);
      const secondPage = await repository.findAll(5, 5);

      expect(firstPage.length).toBeLessThanOrEqual(5);
      expect(secondPage.length).toBeLessThanOrEqual(5);
      // Results should be different
      expect(firstPage[0]?.id).not.toBe(secondPage[0]?.id);
    });
  });

  describe('update', () => {
    it('should update player', async () => {
      const created = await repository.create({
        name: 'Update Player',
        email: 'update@example.com',
      });

      const updates: IPlayerUpdate = {
        displayName: 'Updated Display',
        bio: 'Updated bio',
      };

      const updated = await repository.update(created.id, updates);

      expect(updated.displayName).toBe('Updated Display');
      expect(updated.bio).toBe('Updated bio');
    });
  });

  describe('delete', () => {
    it('should soft delete player', async () => {
      const created = await repository.create({
        name: 'Delete Player',
        email: 'delete@example.com',
      });

      await repository.delete(created.id);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});

