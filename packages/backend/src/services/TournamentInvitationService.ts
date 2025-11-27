/**
 * Tournament Invitation Service
 * 
 * Handles tournament invitation token generation and join-by-token functionality
 * Following ISP: Small, focused interface for tournament invitations only
 */

import {
  ITournamentInvitationResponseDto,
  ITournamentInvitationDetailsDto,
  IJoinTournamentByTokenDto,
  IJoinTournamentResultDto,
  TournamentStatus,
} from '@rpsfull-platform/contracts';
import { ITournamentRepository } from '@rpsfull-platform/contracts';
import { IUserRepository, IPlayerRepository } from '@rpsfull-platform/contracts';
import { TournamentRegistrationService } from './TournamentRegistrationService';
import { IQrCodeService } from '@rpsfull-platform/contracts';
import { getOrCreatePlayer } from '../utils/PlayerUtils';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

export class TournamentInvitationService {
  constructor(
    private tournamentRepository: ITournamentRepository,
    private userRepository: IUserRepository,
    private playerRepository: IPlayerRepository,
    private tournamentRegistrationService: TournamentRegistrationService,
    private qrCodeService: IQrCodeService
  ) {}

  /**
   * Create invitation for tournament (organizer only)
   */
  async createInvitation(
    tournamentId: string,
    organizerId: string
  ): Promise<ITournamentInvitationResponseDto> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.organizerId !== organizerId) {
      throw new Error('Not authorized');
    }

    // Generate token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Update tournament with invitation
    await this.tournamentRepository.update(tournamentId, {
      invitationToken: token,
      invitationExpiresAt: expiresAt,
      invitationCreatedAt: new Date(),
      invitationEnabled: true,
    });

    // Generate invitation link
    const baseUrl = process.env['FRONTEND_URL'] || 'http://localhost:4445';
    const invitationLink = `${baseUrl}/join-tournament/${token}`;

    // Generate QR code
    const qrCodeDataUrl = await this.qrCodeService.generateQRCode(invitationLink, {
      width: 300,
      errorCorrectionLevel: 'M',
    });

    return {
      tournamentId,
      invitationToken: token,
      invitationLink,
      qrCodeDataUrl,
      expiresAt,
      tournamentName: tournament.name,
    };
  }

  /**
   * Get invitation details by token (public)
   */
  async getInvitationDetails(token: string): Promise<ITournamentInvitationDetailsDto> {
    const tournament = await (this.tournamentRepository as any).findByInvitationToken(token);
    if (!tournament) {
      throw new Error('Invalid invitation token');
    }

    // Check if token is expired
    if (tournament.invitationExpiresAt && tournament.invitationExpiresAt < new Date()) {
      throw new Error('Invitation expired');
    }

    // Get organizer name
    const organizer = await this.userRepository.findById(tournament.organizerId);
    const organizerName = organizer
      ? `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim() || organizer.username
      : 'Organizer';

    return {
      tournamentId: tournament.id,
      name: tournament.name,
      description: tournament.description,
      tournamentType: tournament.tournamentType as any,
      currentParticipants: tournament.participantCount,
      maxParticipants: tournament.maxParticipants,
      startDate: tournament.startDate,
      organizerName,
    };
  }

  /**
   * Join tournament via token (public, creates user if needed)
   */
  async joinByToken(
    token: string,
    playerInfo: { firstName: string; lastName: string; email: string }
  ): Promise<IJoinTournamentResultDto> {
    const tournament = await (this.tournamentRepository as any).findByInvitationToken(token);
    if (!tournament) {
      throw new Error('Invalid invitation token');
    }

    // Check if token is expired
    if (tournament.invitationExpiresAt && tournament.invitationExpiresAt < new Date()) {
      throw new Error('Invitation expired');
    }

    // Check if registration is open
    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      throw new Error('Registration closed');
    }

    // Get or create player
    const { player } = await getOrCreatePlayer(
      playerInfo,
      this.userRepository,
      this.playerRepository
    );

    // Register player for tournament
    await this.tournamentRegistrationService.registerPlayer(tournament.id, player.id);

    // Generate access token for auto-login
    if (!player.userId) {
      throw new Error('Player missing user ID');
    }

    const accessToken = this.generateAccessToken(player.userId);

    return {
      tournamentId: tournament.id,
      playerId: player.id,
      accessToken,
    };
  }

  /**
   * Revoke invitation (organizer only)
   */
  async revokeInvitation(tournamentId: string, organizerId: string): Promise<void> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.organizerId !== organizerId) {
      throw new Error('Not authorized');
    }

    await this.tournamentRepository.update(tournamentId, {
      invitationToken: null,
      invitationExpiresAt: null,
      invitationCreatedAt: null,
      invitationEnabled: false,
    });
  }

  /**
   * Regenerate invitation token (organizer only)
   */
  async regenerateToken(tournamentId: string, organizerId: string): Promise<string> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.organizerId !== organizerId) {
      throw new Error('Not authorized');
    }

    // Generate new token
    const newToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.tournamentRepository.update(tournamentId, {
      invitationToken: newToken,
      invitationExpiresAt: expiresAt,
      invitationCreatedAt: new Date(),
      invitationEnabled: true,
    });

    return newToken;
  }

  private generateAccessToken(userId: string): string {
    const secret = process.env['JWT_SECRET'] || 'default-secret-change-in-production';
    return jwt.sign({ userId }, secret, { expiresIn: '7d' });
  }
}

