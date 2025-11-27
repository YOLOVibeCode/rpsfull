/**
 * Tournament Magic Link Service Tests
 * 
 * TDD: Tests for magic link registration system
 */

import { TournamentMagicLinkService } from '../TournamentMagicLinkService';
import { TournamentRepository } from '../../repositories/TournamentRepository';
import { TournamentRegistrationTokenRepository } from '../../repositories/TournamentRegistrationTokenRepository';
import { TournamentRegistrationService } from '../TournamentRegistrationService';
import { getOrCreatePlayer } from '../../utils/PlayerUtils';
import { PrismaClient } from '@prisma/client';
import { TournamentStatus } from '@rpsfull-platform/contracts';

// Mock dependencies
jest.mock('../../utils/PlayerUtils');
jest.mock('../EmailService');

describe('TournamentMagicLinkService', () => {
  let service: TournamentMagicLinkService;
  let mockTournamentRepository: jest.Mocked<TournamentRepository>;
  let mockTokenRepository: jest.Mocked<TournamentRegistrationTokenRepository>;
  let mockRegistrationService: jest.Mocked<TournamentRegistrationService>;
  let mockEmailService: any;

  beforeEach(() => {
    mockTournamentRepository = {
      findById: jest.fn(),
    } as any;

    mockTokenRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markUsed: jest.fn(),
    } as any;

    mockRegistrationService = {
      registerPlayer: jest.fn(),
    } as any;

    mockEmailService = {
      sendTournamentRegistrationEmail: jest.fn(),
    };

    service = new TournamentMagicLinkService(
      mockTournamentRepository,
      mockTokenRepository,
      mockRegistrationService,
      mockEmailService
    );
  });

  describe('requestRegistration', () => {
    it('should create token and send email', async () => {
      // Arrange
      const tournamentId = 'tournament-1';
      const email = 'player@example.com';
      
      const tournament = {
        id: tournamentId,
        status: TournamentStatus.REGISTRATION_OPEN,
        name: 'Test Tournament',
      } as any;

      mockTournamentRepository.findById.mockResolvedValue(tournament);
      mockTokenRepository.create.mockResolvedValue({
        id: 'token-1',
        tournamentId,
        email,
        token: 'magic-token',
        expiresAt: new Date(),
        createdAt: new Date(),
      } as any);

      // Act
      await service.requestRegistration(tournamentId, email, 'John', 'Doe');

      // Assert
      expect(mockTokenRepository.create).toHaveBeenCalled();
      expect(mockEmailService.sendTournamentRegistrationEmail).toHaveBeenCalled();
    });

    it('should throw error if tournament not found', async () => {
      // Arrange
      mockTournamentRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.requestRegistration('non-existent', 'player@example.com')
      ).rejects.toThrow('Tournament not found');
    });

    it('should throw error if registration closed', async () => {
      // Arrange
      const tournament = {
        id: 'tournament-1',
        status: TournamentStatus.IN_PROGRESS,
      } as any;

      mockTournamentRepository.findById.mockResolvedValue(tournament);

      // Act & Assert
      await expect(
        service.requestRegistration('tournament-1', 'player@example.com')
      ).rejects.toThrow('Registration closed');
    });
  });

  describe('confirmRegistration', () => {
    it('should register player and mark token as used', async () => {
      // Arrange
      const token = 'magic-token';
      const regToken = {
        id: 'token-1',
        tournamentId: 'tournament-1',
        email: 'player@example.com',
        firstName: 'John',
        lastName: 'Doe',
        expiresAt: new Date(Date.now() + 86400000),
        usedAt: null,
      } as any;

      const player = {
        id: 'player-1',
        userId: 'user-1',
      } as any;

      mockTokenRepository.findByToken.mockResolvedValue(regToken);
      (getOrCreatePlayer as jest.Mock).mockResolvedValue({
        player,
        userCreated: true,
        playerCreated: true,
      });
      mockRegistrationService.registerPlayer.mockResolvedValue();
      mockTokenRepository.markUsed.mockResolvedValue();

      // Mock JWT generation
      jest.spyOn(service as any, 'generateAccessToken').mockReturnValue('access-token');

      // Act
      const result = await service.confirmRegistration(token);

      // Assert
      expect(result.tournamentId).toBe('tournament-1');
      expect(result.playerId).toBe('player-1');
      expect(result.accessToken).toBe('access-token');
      expect(mockRegistrationService.registerPlayer).toHaveBeenCalled();
      expect(mockTokenRepository.markUsed).toHaveBeenCalledWith(token);
    });

    it('should throw error for invalid token', async () => {
      // Arrange
      mockTokenRepository.findByToken.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.confirmRegistration('invalid-token')
      ).rejects.toThrow('Invalid token');
    });

    it('should throw error for expired token', async () => {
      // Arrange
      const regToken = {
        expiresAt: new Date(Date.now() - 86400000), // Yesterday
      } as any;

      mockTokenRepository.findByToken.mockResolvedValue(regToken);

      // Act & Assert
      await expect(
        service.confirmRegistration('expired-token')
      ).rejects.toThrow('Token expired');
    });

    it('should throw error for already used token', async () => {
      // Arrange
      const regToken = {
        usedAt: new Date(),
      } as any;

      mockTokenRepository.findByToken.mockResolvedValue(regToken);

      // Act & Assert
      await expect(
        service.confirmRegistration('used-token')
      ).rejects.toThrow('Token already used');
    });
  });
});

