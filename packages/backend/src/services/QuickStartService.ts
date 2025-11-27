/**
 * Quick Start Service
 * 
 * Handles quick game start without full authentication
 * Creates or finds user/player and starts a match immediately
 */

import { IUserRepository, IPlayer } from '@rpsfull-platform/contracts';
import { IPlayerRepository } from '@rpsfull-platform/contracts';
import { IMatchRepository } from '@rpsfull-platform/contracts';
import { IGameTypeRepository } from '@rpsfull-platform/contracts';
import { UserRole } from '@rpsfull-platform/contracts';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

interface PlayerInfo {
  firstName: string;
  lastName: string;
  email: string;
}

interface QuickStartRequest {
  player1: PlayerInfo;
  player2: PlayerInfo;
}

interface QuickStartResponse {
  matchId: string;
  player1Id: string;
  player2Id: string;
  accessToken?: string;
  refreshToken?: string;
}

export class QuickStartService {
  constructor(
    private userRepository: IUserRepository,
    private playerRepository: IPlayerRepository,
    private matchRepository: IMatchRepository,
    private gameTypeRepository: IGameTypeRepository
  ) {}

  async quickStartGame(data: QuickStartRequest): Promise<QuickStartResponse> {
    // Validate data structure
    if (!data?.player1 || !data?.player2) {
      throw new Error('Both player1 and player2 are required');
    }
    
    // Validate and normalize emails
    if (!data.player1?.email || typeof data.player1.email !== 'string' || !data.player1.email.trim()) {
      throw new Error('Player 1 email is required and must be a non-empty string');
    }
    if (!data.player2?.email || typeof data.player2.email !== 'string' || !data.player2.email.trim()) {
      throw new Error('Player 2 email is required and must be a non-empty string');
    }
    
    // Normalize emails for comparison (safe - we've validated they exist and are strings)
    const player1Email = String(data.player1.email).trim().toLowerCase();
    const player2Email = String(data.player2.email).trim().toLowerCase();
    
    if (!player1Email || !player2Email) {
      throw new Error('Email addresses cannot be empty after normalization');
    }
    
    if (player1Email === player2Email) {
      throw new Error('Players must have different email addresses');
    }

    // Get or create both players (use normalized emails and ensure all fields are strings)
    const player1 = await this.getOrCreatePlayer({
      firstName: String(data.player1.firstName || '').trim(),
      lastName: String(data.player1.lastName || '').trim(),
      email: player1Email,
    });
    const player2 = await this.getOrCreatePlayer({
      firstName: String(data.player2.firstName || '').trim(),
      lastName: String(data.player2.lastName || '').trim(),
      email: player2Email,
    });

    // Get default game type
    const gameType = await this.gameTypeRepository.findDefault();
    if (!gameType) {
      throw new Error('No default game type found');
    }

    // Create match
    const match = await this.matchRepository.create({
      player1Id: player1.id,
      player2Id: player2.id,
      gameTypeId: gameType.id,
      bestOfN: 3,
      playMode: 'digital',
      status: 'pending',
    });

    // Generate tokens for player1 (primary user)
    // Player should always have userId after getOrCreatePlayer
    if (!player1.userId) {
      throw new Error('Player 1 missing user ID');
    }
    
    const user1 = await this.userRepository.findById(player1.userId);
    if (!user1) {
      throw new Error('User not found for player 1');
    }

    const accessToken = this.generateAccessToken(user1.id);
    const refreshToken = this.generateRefreshToken(user1.id);

    return {
      matchId: match.id,
      player1Id: player1.id,
      player2Id: player2.id,
      accessToken,
      refreshToken,
    };
  }

  private async getOrCreatePlayer(playerInfo: PlayerInfo): Promise<IPlayer> {
    if (!playerInfo) {
      throw new Error('Player info is required');
    }
    if (!playerInfo.email || typeof playerInfo.email !== 'string') {
      throw new Error(`Player email is required and must be a string. Received: ${JSON.stringify(playerInfo)}`);
    }
    const email = playerInfo.email.toLowerCase().trim();
    if (!email) {
      throw new Error('Player email cannot be empty');
    }
    const firstName = playerInfo.firstName || '';
    const lastName = playerInfo.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    // Check if user exists
    let user = await this.userRepository.findByEmail(email);
    let player = user ? await this.playerRepository.findByUserId(user.id) : null;

    // If user doesn't exist, create them
    if (!user) {
      // Generate a temporary password (user can set real one later)
      const tempPassword = `temp_${Math.random().toString(36).slice(2)}`;
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Generate username from email if not provided
      const username = email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 8);
      
      // Create user
      user = await this.userRepository.create({
        username,
        email,
        passwordHash,
        role: UserRole.PLAYER,
      });

      // Mark email as verified for quick start
      await this.userRepository.update(user.id, {
        isEmailVerified: true,
      });

      // Create player profile
      player = await this.playerRepository.create({
        userId: user.id,
        name: fullName,
        displayName: String(playerInfo.firstName || '').trim() || fullName,
        email: user.email,
      });
    } else if (!player) {
      // User exists but no player profile - create one
      player = await this.playerRepository.create({
        userId: user.id,
        name: fullName,
        displayName: String(playerInfo.firstName || '').trim() || fullName,
        email: user.email,
      });
    } else {
      // Update player name if it changed
      if (player.name !== fullName) {
        await this.playerRepository.update(player.id, {
          name: fullName,
          displayName: String(playerInfo.firstName || '').trim() || fullName,
        });
        player = await this.playerRepository.findById(player.id);
      }
    }

    if (!player) {
      throw new Error('Failed to create or find player');
    }

    // Ensure userId exists (should always be set in our flow)
    if (!player.userId) {
      throw new Error('Player created without user ID');
    }

    return player as IPlayer;
  }

  private generateAccessToken(userId: string): string {
    const secret = process.env['JWT_SECRET'] || 'default-secret-change-in-production';
    return jwt.sign({ userId }, secret, { expiresIn: '7d' });
  }

  private generateRefreshToken(userId: string): string {
    const secret = process.env['JWT_REFRESH_SECRET'] || 'default-refresh-secret-change-in-production';
    return jwt.sign({ userId }, secret, { expiresIn: '30d' });
  }
}

