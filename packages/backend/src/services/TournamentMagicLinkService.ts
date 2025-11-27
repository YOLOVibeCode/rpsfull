/**
 * Tournament Magic Link Service
 * 
 * Handles email-based tournament registration via magic links
 * Following ISP: Small, focused interface for magic link registration only
 */

import {
  IJoinTournamentResultDto,
  TournamentStatus,
} from '@rpsfull-platform/contracts';
import { ITournamentRepository } from '@rpsfull-platform/contracts';
import { TournamentRegistrationTokenRepository } from '../repositories/TournamentRegistrationTokenRepository';
import { TournamentRegistrationService } from './TournamentRegistrationService';
import { IEmailService } from '@rpsfull-platform/contracts';
import { getOrCreatePlayer } from '../utils/PlayerUtils';
import { userRepository, playerRepository } from '../config/services';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';

export class TournamentMagicLinkService {
  constructor(
    private tournamentRepository: ITournamentRepository,
    private tokenRepository: TournamentRegistrationTokenRepository,
    private tournamentRegistrationService: TournamentRegistrationService,
    private emailService: IEmailService
  ) {}

  /**
   * Request registration via email (public)
   * Creates token and sends confirmation email
   */
  async requestRegistration(
    tournamentId: string,
    email: string,
    firstName?: string,
    lastName?: string
  ): Promise<void> {
    const tournament = await this.tournamentRepository.findById(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== TournamentStatus.REGISTRATION_OPEN) {
      throw new Error('Registration closed');
    }

    // Check if already registered
    const existingPlayer = await playerRepository.findByEmail(email);
    if (existingPlayer) {
      const entryRepository = require('../config/services').tournamentEntryRepository;
      const entry = await entryRepository.findByTournamentAndPlayer(
        tournamentId,
        existingPlayer.id
      );
      if (entry) {
        throw new Error('Already registered');
      }
    }

    // Generate token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    await this.tokenRepository.create({
      tournamentId,
      email: email.toLowerCase().trim(),
      token,
      firstName,
      lastName,
      expiresAt,
    });

    // Send email
    const baseUrl = process.env['FRONTEND_URL'] || 'http://localhost:4445';
    const confirmLink = `${baseUrl}/confirm-tournament/${token}`;

    await this.emailService.sendTournamentRegistrationEmail({
      to: email,
      tournamentName: tournament.name,
      confirmLink,
      expiresAt,
    });
  }

  /**
   * Confirm registration via token (public)
   * Creates user/player if needed and registers for tournament
   */
  async confirmRegistration(token: string): Promise<IJoinTournamentResultDto> {
    const regToken = await this.tokenRepository.findByToken(token);
    if (!regToken) {
      throw new Error('Invalid token');
    }

    if (regToken.expiresAt < new Date()) {
      throw new Error('Token expired');
    }

    if (regToken.usedAt) {
      throw new Error('Token already used');
    }

    // Get or create player
    const { player } = await getOrCreatePlayer(
      {
        email: regToken.email,
        firstName: regToken.firstName || '',
        lastName: regToken.lastName || '',
      },
      userRepository,
      playerRepository
    );

    // Register for tournament
    await this.tournamentRegistrationService.registerPlayer(
      regToken.tournamentId,
      player.id
    );

    // Mark token as used
    await this.tokenRepository.markUsed(token);

    // Generate auth tokens
    if (!player.userId) {
      throw new Error('Player missing user ID');
    }

    const accessToken = this.generateAccessToken(player.userId);

    return {
      tournamentId: regToken.tournamentId,
      playerId: player.id,
      accessToken,
    };
  }

  private generateAccessToken(userId: string): string {
    const secret = process.env['JWT_SECRET'] || 'default-secret-change-in-production';
    return jwt.sign({ userId }, secret, { expiresIn: '7d' });
  }
}

