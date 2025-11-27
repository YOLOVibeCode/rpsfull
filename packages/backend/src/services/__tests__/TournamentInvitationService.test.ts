/**
 * Tournament Invitation Service Tests
 * 
 * TDD: Tests for tournament invitation token system
 */

import { TournamentInvitationService } from '../TournamentInvitationService';
import { TournamentRepository } from '../../repositories/TournamentRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { PlayerRepository } from '../../repositories/PlayerRepository';
import { TournamentRegistrationService } from '../TournamentRegistrationService';
import { QrCodeService } from '../QrCodeService';
import { getOrCreatePlayer } from '../../utils/PlayerUtils';
import { PrismaClient } from '@prisma/client';
import { TournamentType, TournamentStatus } from '@rpsfull-platform/contracts';

// Mock dependencies
jest.mock('../../utils/PlayerUtils');
jest.mock('../QrCodeService');

describe('TournamentInvitationService', () => {
  let service: TournamentInvitationService;
  let mockTournamentRepository: jest.Mocked<TournamentRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockPlayerRepository: jest.Mocked<PlayerRepository>;
  let mockRegistrationService: jest.Mocked<TournamentRegistrationService>;
  let mockQrCodeService: jest.Mocked<QrCodeService>;

  beforeEach(() => {
    mockTournamentRepository = {
      findById: jest.fn(),
      findByInvitationToken: jest.fn(),
      update: jest.fn(),
    } as any;

    mockUserRepository = {} as any;
    mockPlayerRepository = {} as any;
    mockRegistrationService = {
      registerPlayer: jest.fn(),
    } as any;

    mockQrCodeService = {
      generateQRCode: jest.fn(),
    } as any;

    service = new TournamentInvitationService(
      mockTournamentRepository,
      mockUserRepository,
      mockPlayerRepository,
      mockRegistrationService,
      mockQrCodeService
    );
  });

  describe('createInvitation', () => {
    it('should create invitation token and QR code for tournament', async () => {
      // Arrange
      const tournamentId = 'tournament-1';
      const organizerId = 'organizer-1';
      
      const tournament = {
        id: tournamentId,
        name: 'Test Tournament',
        organizerId,
        status: TournamentStatus.REGISTRATION_OPEN,
      } as any;

      mockTournamentRepository.findById.mockResolvedValue(tournament);
      mockTournamentRepository.update.mockResolvedValue({
        ...tournament,
        invitationToken: 'new-token',
        invitationExpiresAt: new Date(),
      } as any);

      mockQrCodeService.generateQRCode.mockResolvedValue('data:image/png;base64,...');

      // Act
      const result = await service.createInvitation(tournamentId, organizerId);

      // Assert
      expect(result.tournamentId).toBe(tournamentId);
      expect(result.invitationToken).toBeDefined();
      expect(result.invitationLink).toContain('/join-tournament/');
      expect(result.qrCodeDataUrl).toBe('data:image/png;base64,...');
      expect(mockTournamentRepository.update).toHaveBeenCalled();
    });

    it('should throw error if tournament not found', async () => {
      // Arrange
      mockTournamentRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.createInvitation('non-existent', 'organizer-1')
      ).rejects.toThrow('Tournament not found');
    });

    it('should throw error if not organizer', async () => {
      // Arrange
      const tournament = {
        id: 'tournament-1',
        organizerId: 'other-organizer',
      } as any;

      mockTournamentRepository.findById.mockResolvedValue(tournament);

      // Act & Assert
      await expect(
        service.createInvitation('tournament-1', 'wrong-organizer')
      ).rejects.toThrow('Not authorized');
    });
  });

  describe('getInvitationDetails', () => {
    it('should return invitation details for valid token', async () => {
      // Arrange
      const token = 'valid-token';
      const tournament = {
        id: 'tournament-1',
        name: 'Test Tournament',
        description: 'Test',
        tournamentType: TournamentType.SINGLE_ELIMINATION,
        participantCount: 5,
        maxParticipants: 16,
        invitationExpiresAt: new Date(Date.now() + 86400000), // Tomorrow
      } as any;

      mockTournamentRepository.findByInvitationToken.mockResolvedValue(tournament);
      mockQrCodeService.generateQRCode.mockResolvedValue('qr-code-data');

      // Act
      const result = await service.getInvitationDetails(token);

      // Assert
      expect(result.tournamentId).toBe('tournament-1');
      expect(result.name).toBe('Test Tournament');
      expect(mockTournamentRepository.findByInvitationToken).toHaveBeenCalledWith(token);
    });

    it('should throw error for invalid token', async () => {
      // Arrange
      mockTournamentRepository.findByInvitationToken.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getInvitationDetails('invalid-token')
      ).rejects.toThrow('Invalid invitation token');
    });

    it('should throw error for expired token', async () => {
      // Arrange
      const tournament = {
        id: 'tournament-1',
        invitationExpiresAt: new Date(Date.now() - 86400000), // Yesterday
      } as any;

      mockTournamentRepository.findByInvitationToken.mockResolvedValue(tournament);

      // Act & Assert
      await expect(
        service.getInvitationDetails('expired-token')
      ).rejects.toThrow('Invitation expired');
    });
  });

  describe('joinByToken', () => {
    it('should register player and return access token', async () => {
      // Arrange
      const token = 'valid-token';
      const playerInfo = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const tournament = {
        id: 'tournament-1',
        status: TournamentStatus.REGISTRATION_OPEN,
        invitationExpiresAt: new Date(Date.now() + 86400000),
      } as any;

      const player = {
        id: 'player-1',
        userId: 'user-1',
      } as any;

      mockTournamentRepository.findByInvitationToken.mockResolvedValue(tournament);
      (getOrCreatePlayer as jest.Mock).mockResolvedValue({
        player,
        userCreated: true,
        playerCreated: true,
      });
      mockRegistrationService.registerPlayer.mockResolvedValue();

      // Mock JWT generation
      jest.spyOn(service as any, 'generateAccessToken').mockReturnValue('access-token');

      // Act
      const result = await service.joinByToken(token, playerInfo);

      // Assert
      expect(result.tournamentId).toBe('tournament-1');
      expect(result.playerId).toBe('player-1');
      expect(result.accessToken).toBe('access-token');
      expect(mockRegistrationService.registerPlayer).toHaveBeenCalledWith('tournament-1', 'player-1');
    });

    it('should throw error if registration closed', async () => {
      // Arrange
      const tournament = {
        id: 'tournament-1',
        status: TournamentStatus.IN_PROGRESS,
      } as any;

      mockTournamentRepository.findByInvitationToken.mockResolvedValue(tournament);

      // Act & Assert
      await expect(
        service.joinByToken('token', { firstName: 'John', lastName: 'Doe', email: 'john@example.com' })
      ).rejects.toThrow('Registration closed');
    });
  });
});

