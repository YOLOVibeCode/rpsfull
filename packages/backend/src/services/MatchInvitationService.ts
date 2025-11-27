/**
 * Match Invitation Service
 * 
 * Implements IMatchInvitationService interface
 * Following ISP: Small, focused interface implementation
 */

import {
  IMatchInvitationService,
  ICreateMatchWithInvitationDto,
  IJoinMatchByTokenDto,
  IMatchInvitationResponseDto,
  IMatch,
  MatchStatus,
} from '@rpsfull-platform/contracts';
import { IUserRepository, IPlayerRepository, IMatchRepository, IGameTypeRepository } from '@rpsfull-platform/contracts';
import { UserRole } from '@rpsfull-platform/contracts';
import { IQrCodeService } from '@rpsfull-platform/contracts';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

export class MatchInvitationService implements IMatchInvitationService {
  constructor(
    private userRepository: IUserRepository,
    private playerRepository: IPlayerRepository,
    private matchRepository: IMatchRepository,
    private gameTypeRepository: IGameTypeRepository,
    private qrCodeService: IQrCodeService
  ) {}

  async createMatchWithInvitation(
    data: ICreateMatchWithInvitationDto
  ): Promise<IMatchInvitationResponseDto> {
    // Get or create Player 1
    const player1 = await this.getOrCreatePlayer(data.player1);

    // Get default game type if not specified
    const gameType = data.gameTypeId
      ? await this.gameTypeRepository.findById(data.gameTypeId)
      : await this.gameTypeRepository.findDefault();

    if (!gameType) {
      throw new Error('Game type not found');
    }

    // Generate invitation token
    const invitationToken = uuidv4();
    const expirationHours = data.expirationHours || 24;
    const invitationExpiresAt = new Date();
    invitationExpiresAt.setHours(invitationExpiresAt.getHours() + expirationHours);
    const invitationCreatedAt = new Date();

    // Create match in pending status (no Player 2 yet)
    const match = await this.matchRepository.create({
      player1Id: player1.id,
      gameTypeId: gameType.id,
      bestOfN: data.bestOfN || 3,
      playMode: 'digital',
      invitationToken,
      invitationExpiresAt,
      invitedPlayerEmail: data.invitedPlayerEmail?.toLowerCase().trim(),
      invitationCreatedAt,
    });

    // Generate invitation link
    const baseUrl = process.env['FRONTEND_URL'] || 'http://localhost:4445';
    const invitationLink = `${baseUrl}/join-game/${invitationToken}`;

    // Generate QR code
    const qrCodeDataUrl = await this.qrCodeService.generateQRCode(invitationLink, {
      width: 300,
      errorCorrectionLevel: 'M',
    });

    return {
      matchId: match.id,
      invitationToken,
      invitationLink,
      qrCodeDataUrl,
      expiresAt: invitationExpiresAt,
      player1Name: player1.name,
    };
  }

  async joinMatchByToken(data: IJoinMatchByTokenDto): Promise<IMatch> {
    // Find match by token
    const match = await this.matchRepository.findByInvitationToken(data.token);

    if (!match) {
      throw new Error('Invalid invitation token');
    }

    // Check if token is expired
    if (match.invitationExpiresAt && match.invitationExpiresAt < new Date()) {
      throw new Error('Invitation token has expired');
    }

    // Check if match already has Player 2
    if (match.player2Id) {
      throw new Error('Match already has a second player');
    }

    // Check if match is still pending
    if (match.status !== MatchStatus.PENDING) {
      throw new Error('Match is no longer available to join');
    }

    // Get or create Player 2
    const player2 = await this.getOrCreatePlayer(data.player2);

    // Update match with Player 2 and invalidate token
    const updatedMatch = await this.matchRepository.update(match.id, {
      player2Id: player2.id,
      status: MatchStatus.READY,
      invitationToken: null,
      invitationExpiresAt: null,
    });

    return updatedMatch;
  }

  async getInvitationDetails(token: string): Promise<IMatchInvitationResponseDto> {
    const match = await this.matchRepository.findByInvitationToken(token);

    if (!match) {
      throw new Error('Invalid invitation token');
    }

    // Check if token is expired
    if (match.invitationExpiresAt && match.invitationExpiresAt < new Date()) {
      throw new Error('Invitation token has expired');
    }

    // Get Player 1 details
    const player1 = await this.playerRepository.findById(match.player1Id);
    if (!player1) {
      throw new Error('Player 1 not found');
    }

    // Generate invitation link
    const baseUrl = process.env['FRONTEND_URL'] || 'http://localhost:4445';
    const invitationLink = `${baseUrl}/join-game/${token}`;

    // Generate QR code
    const qrCodeDataUrl = await this.qrCodeService.generateQRCode(invitationLink, {
      width: 300,
      errorCorrectionLevel: 'M',
    });

    return {
      matchId: match.id,
      invitationToken: token,
      invitationLink,
      qrCodeDataUrl,
      expiresAt: match.invitationExpiresAt!,
      player1Name: player1.name,
    };
  }

  async regenerateInvitationToken(matchId: string): Promise<string> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.player2Id) {
      throw new Error('Cannot regenerate token for match that already has Player 2');
    }

    // Generate new token
    const newToken = uuidv4();
    const expirationHours = 24; // Default 24 hours
    const invitationExpiresAt = new Date();
    invitationExpiresAt.setHours(invitationExpiresAt.getHours() + expirationHours);
    const invitationCreatedAt = new Date();

    await this.matchRepository.update(matchId, {
      invitationToken: newToken,
      invitationExpiresAt,
      invitationCreatedAt,
    });

    return newToken;
  }

  async revokeInvitation(matchId: string): Promise<void> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new Error('Match not found');
    }

    await this.matchRepository.update(matchId, {
      invitationToken: null,
      invitationExpiresAt: null,
      invitedPlayerEmail: null,
      invitationCreatedAt: null,
    });
  }

  private async getOrCreatePlayer(playerInfo: {
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<any> {
    if (!playerInfo || !playerInfo.email || typeof playerInfo.email !== 'string') {
      throw new Error(`Invalid player info: ${JSON.stringify(playerInfo)}`);
    }
    const email = playerInfo.email.toLowerCase().trim();
    const fullName = `${playerInfo.firstName} ${playerInfo.lastName}`.trim();

    // Check if user exists
    let user = await this.userRepository.findByEmail(email);
    let player = user ? await this.playerRepository.findByUserId(user.id) : null;

    // If user doesn't exist, create them
    if (!user) {
      // Generate a temporary password
      const tempPassword = `temp_${Math.random().toString(36).slice(2)}`;
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Generate username from email
      const username = email.split('@')[0].replace(/[^a-z0-9]/g, '_').substring(0, 30);
      let finalUsername = username;
      let counter = 1;
      while (await this.userRepository.usernameExists(finalUsername)) {
        finalUsername = `${username}${counter}`.substring(0, 30);
        counter++;
      }

      // Create user
      user = await this.userRepository.create({
        username: finalUsername,
        email,
        firstName: playerInfo.firstName,
        lastName: playerInfo.lastName,
        passwordHash,
        role: UserRole.PLAYER,
      });

      // Mark email as verified
      await this.userRepository.update(user.id, {
        isEmailVerified: true,
      });

      // Create player profile
      player = await this.playerRepository.create({
        userId: user.id,
        name: fullName,
        displayName: playerInfo.firstName,
        email: user.email,
      });
    } else if (!player) {
      // User exists but no player profile - create one
      player = await this.playerRepository.create({
        userId: user.id,
        name: fullName,
        displayName: playerInfo.firstName,
        email: user.email,
      });
    } else {
      // Update player name if it changed
      if (player.name !== fullName) {
        await this.playerRepository.update(player.id, {
          name: fullName,
          displayName: playerInfo.firstName,
        });
        player = await this.playerRepository.findById(player.id);
      }
    }

    if (!player) {
      throw new Error('Failed to create or find player');
    }

    return player;
  }
}

