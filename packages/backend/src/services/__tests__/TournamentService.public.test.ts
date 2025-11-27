/**
 * Tournament Service Public Endpoint Tests
 * 
 * TDD: Tests for public tournament access (no authentication)
 */

import { TournamentService } from '../TournamentService';
import { TournamentRepository } from '../../repositories/TournamentRepository';
import { GameTypeRepository } from '../../repositories/GameTypeRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { PrismaClient } from '@prisma/client';
import { TournamentType, TournamentStatus } from '@rpsfull-platform/contracts';

describe('TournamentService - Public Access', () => {
  let prisma: PrismaClient;
  let tournamentRepository: TournamentRepository;
  let gameTypeRepository: GameTypeRepository;
  let userRepository: UserRepository;
  let tournamentService: TournamentService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    tournamentRepository = new TournamentRepository(prisma);
    gameTypeRepository = new GameTypeRepository(prisma);
    userRepository = new UserRepository(prisma);
    tournamentService = new TournamentService(tournamentRepository, gameTypeRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.tournament.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('getPublicTournamentById', () => {
    it('should return public tournament information without sensitive data', async () => {
      // Arrange - Create test data
      const organizer = await userRepository.create({
        username: 'organizer_public',
        email: 'organizer@test.com',
        passwordHash: 'hash',
        role: 'organizer',
      });

      const gameType = await gameTypeRepository.create({
        name: 'test-rps',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
      });

      const tournament = await tournamentRepository.create(
        {
          name: 'Public Test Tournament',
          description: 'Test description',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
          maxParticipants: 16,
        },
        organizer.id
      );

      // Act
      const publicTournament = await tournamentService.getPublicTournamentById(tournament.id);

      // Assert
      expect(publicTournament).toBeDefined();
      expect(publicTournament.id).toBe(tournament.id);
      expect(publicTournament.name).toBe('Public Test Tournament');
      expect(publicTournament.description).toBe('Test description');
      expect(publicTournament.currentParticipants).toBe(5);
      expect(publicTournament.maxParticipants).toBe(16);
      expect(publicTournament.gameType).toBeDefined();
      expect(publicTournament.gameType.name).toBe('test-rps');
      
      // Should NOT include sensitive data
      expect((publicTournament as any).organizerId).toBeUndefined();
      expect((publicTournament as any).bracketData).toBeUndefined();
    });

    it('should throw error if tournament not found', async () => {
      // Act & Assert
      await expect(
        tournamentService.getPublicTournamentById('non-existent-id')
      ).rejects.toThrow('Tournament not found');
    });

    it('should return tournament even if registration is closed', async () => {
      // Arrange
      const organizer = await userRepository.create({
        username: 'org_closed',
        email: 'org_closed@test.com',
        passwordHash: 'hash',
        role: 'organizer',
      });

      const gameType = await gameTypeRepository.create({
        name: 'closed-rps',
        symbolCount: 3,
        symbols: [],
        winMatrix: {},
      });

      const tournament = await tournamentRepository.create(
        {
          name: 'Closed Tournament',
          gameTypeId: gameType.id,
          tournamentType: TournamentType.SINGLE_ELIMINATION,
          bestOfN: 3,
        },
        organizer.id
      );

      // Update status to IN_PROGRESS
      await tournamentRepository.update(tournament.id, {
        status: TournamentStatus.IN_PROGRESS,
      } as any);

      // Act
      const publicTournament = await tournamentService.getPublicTournamentById(tournament.id);

      // Assert
      expect(publicTournament).toBeDefined();
      expect(publicTournament.status).toBe(TournamentStatus.IN_PROGRESS);
    });
  });
});

