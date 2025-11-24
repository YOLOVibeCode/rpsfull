/**
 * Match Invitation Service Tests
 * 
 * Tests for MatchInvitationService following TDD principles
 */

import { MatchInvitationService } from '../MatchInvitationService';
import { MatchStatus } from '@rpsfull-platform/contracts';
import { v4 as uuidv4 } from 'uuid';

// Mock dependencies
const mockUserRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  usernameExists: jest.fn(),
};

const mockPlayerRepository = {
  findByUserId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
};

const mockMatchRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findByInvitationToken: jest.fn(),
  update: jest.fn(),
};

const mockGameTypeRepository = {
  findById: jest.fn(),
  findDefault: jest.fn(),
};

const mockQrCodeService = {
  generateQRCode: jest.fn(),
};

describe('MatchInvitationService', () => {
  let service: MatchInvitationService;

  beforeEach(() => {
    service = new MatchInvitationService(
      mockUserRepository as any,
      mockPlayerRepository as any,
      mockMatchRepository as any,
      mockGameTypeRepository as any,
      mockQrCodeService as any
    );
    jest.clearAllMocks();
  });

  describe('createMatchWithInvitation', () => {
    it('should create match with invitation token', async () => {
      const player1Data = {
        firstName: 'Rocky',
        lastName: 'Rocker',
        email: 'rocky@example.com',
      };

      const mockPlayer = {
        id: 'player-1',
        name: 'Rocky Rocker',
        displayName: 'Rocky',
      };

      const mockGameType = {
        id: 'game-type-1',
        name: 'Classic RPS',
      };

      const mockMatch = {
        id: 'match-1',
        player1Id: 'player-1',
        invitationToken: 'token-123',
        invitationExpiresAt: new Date(),
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 'user-1',
        email: 'rocky@example.com',
      });
      mockPlayerRepository.findByUserId.mockResolvedValue(null);
      mockPlayerRepository.create.mockResolvedValue(mockPlayer);
      mockGameTypeRepository.findDefault.mockResolvedValue(mockGameType);
      mockMatchRepository.create.mockResolvedValue(mockMatch);
      mockQrCodeService.generateQRCode.mockResolvedValue('data:image/png;base64,test');

      const result = await service.createMatchWithInvitation({
        player1: player1Data,
      });

      expect(result.matchId).toBe('match-1');
      expect(result.invitationToken).toBe('token-123');
      expect(result.qrCodeDataUrl).toBe('data:image/png;base64,test');
      expect(mockMatchRepository.create).toHaveBeenCalled();
    });

    it('should use existing player if email exists', async () => {
      const player1Data = {
        firstName: 'Rocky',
        lastName: 'Rocker',
        email: 'rocky@example.com',
      };

      const mockUser = {
        id: 'user-1',
        email: 'rocky@example.com',
      };

      const mockPlayer = {
        id: 'player-1',
        name: 'Rocky Rocker',
      };

      const mockGameType = {
        id: 'game-type-1',
      };

      const mockMatch = {
        id: 'match-1',
        invitationToken: 'token-123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPlayerRepository.findByUserId.mockResolvedValue(mockPlayer);
      mockGameTypeRepository.findDefault.mockResolvedValue(mockGameType);
      mockMatchRepository.create.mockResolvedValue(mockMatch);
      mockQrCodeService.generateQRCode.mockResolvedValue('data:image/png;base64,test');

      await service.createMatchWithInvitation({
        player1: player1Data,
      });

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockPlayerRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('joinMatchByToken', () => {
    it('should join match with valid token', async () => {
      const token = 'valid-token';
      const mockMatch = {
        id: 'match-1',
        player1Id: 'player-1',
        status: MatchStatus.PENDING,
        invitationExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      };

      const mockPlayer2 = {
        id: 'player-2',
        name: 'Sally Scissor',
      };

      mockMatchRepository.findByInvitationToken.mockResolvedValue(mockMatch);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 'user-2',
        email: 'sally@example.com',
      });
      mockPlayerRepository.create.mockResolvedValue(mockPlayer2);
      mockMatchRepository.update.mockResolvedValue({
        ...mockMatch,
        player2Id: 'player-2',
        status: MatchStatus.READY,
      });

      const result = await service.joinMatchByToken({
        token,
        player2: {
          firstName: 'Sally',
          lastName: 'Scissor',
          email: 'sally@example.com',
        },
      });

      expect(result.player2Id).toBe('player-2');
      expect(result.status).toBe(MatchStatus.READY);
      expect(mockMatchRepository.update).toHaveBeenCalledWith('match-1', {
        player2Id: 'player-2',
        status: MatchStatus.READY,
        invitationToken: null,
        invitationExpiresAt: null,
      });
    });

    it('should throw error for invalid token', async () => {
      mockMatchRepository.findByInvitationToken.mockResolvedValue(null);

      await expect(
        service.joinMatchByToken({
          token: 'invalid-token',
          player2: {
            firstName: 'Sally',
            lastName: 'Scissor',
            email: 'sally@example.com',
          },
        })
      ).rejects.toThrow('Invalid invitation token');
    });

    it('should throw error for expired token', async () => {
      const mockMatch = {
        id: 'match-1',
        invitationExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      };

      mockMatchRepository.findByInvitationToken.mockResolvedValue(mockMatch);

      await expect(
        service.joinMatchByToken({
          token: 'expired-token',
          player2: {
            firstName: 'Sally',
            lastName: 'Scissor',
            email: 'sally@example.com',
          },
        })
      ).rejects.toThrow('Invitation token has expired');
    });

    it('should throw error if match already has Player 2', async () => {
      const mockMatch = {
        id: 'match-1',
        player2Id: 'player-2',
        status: MatchStatus.PENDING,
      };

      mockMatchRepository.findByInvitationToken.mockResolvedValue(mockMatch);

      await expect(
        service.joinMatchByToken({
          token: 'used-token',
          player2: {
            firstName: 'Sally',
            lastName: 'Scissor',
            email: 'sally@example.com',
          },
        })
      ).rejects.toThrow('Match already has a second player');
    });
  });

  describe('getInvitationDetails', () => {
    it('should return invitation details for valid token', async () => {
      const token = 'valid-token';
      const mockMatch = {
        id: 'match-1',
        player1Id: 'player-1',
        invitationExpiresAt: new Date(Date.now() + 3600000),
      };

      const mockPlayer1 = {
        id: 'player-1',
        name: 'Rocky Rocker',
      };

      mockMatchRepository.findByInvitationToken.mockResolvedValue(mockMatch);
      mockPlayerRepository.findById.mockResolvedValue(mockPlayer1);
      mockQrCodeService.generateQRCode.mockResolvedValue('data:image/png;base64,test');

      const result = await service.getInvitationDetails(token);

      expect(result.matchId).toBe('match-1');
      expect(result.player1Name).toBe('Rocky Rocker');
      expect(result.qrCodeDataUrl).toBe('data:image/png;base64,test');
    });

    it('should throw error for invalid token', async () => {
      mockMatchRepository.findByInvitationToken.mockResolvedValue(null);

      await expect(service.getInvitationDetails('invalid-token')).rejects.toThrow(
        'Invalid invitation token'
      );
    });
  });

  describe('regenerateInvitationToken', () => {
    it('should regenerate token for pending match', async () => {
      const matchId = 'match-1';
      const mockMatch = {
        id: matchId,
        player1Id: 'player-1',
        status: MatchStatus.PENDING,
      };

      mockMatchRepository.findById.mockResolvedValue(mockMatch);
      mockMatchRepository.update.mockResolvedValue({
        ...mockMatch,
        invitationToken: 'new-token',
      });

      const newToken = await service.regenerateInvitationToken(matchId);

      expect(newToken).toBeDefined();
      expect(mockMatchRepository.update).toHaveBeenCalled();
    });

    it('should throw error if match has Player 2', async () => {
      const mockMatch = {
        id: 'match-1',
        player2Id: 'player-2',
      };

      mockMatchRepository.findById.mockResolvedValue(mockMatch);

      await expect(service.regenerateInvitationToken('match-1')).rejects.toThrow(
        'Cannot regenerate token for match that already has Player 2'
      );
    });
  });

  describe('revokeInvitation', () => {
    it('should revoke invitation token', async () => {
      const matchId = 'match-1';
      mockMatchRepository.findById.mockResolvedValue({ id: matchId });
      mockMatchRepository.update.mockResolvedValue({ id: matchId });

      await service.revokeInvitation(matchId);

      expect(mockMatchRepository.update).toHaveBeenCalledWith(matchId, {
        invitationToken: null,
        invitationExpiresAt: null,
        invitedPlayerEmail: null,
        invitationCreatedAt: null,
      });
    });
  });
});

