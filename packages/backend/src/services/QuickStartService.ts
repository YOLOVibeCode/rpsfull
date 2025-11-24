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
    // Validate emails are different
    if (data.player1.email.toLowerCase() === data.player2.email.toLowerCase()) {
      throw new Error('Players must have different email addresses');
    }

    // Get or create both players
    const player1 = await this.getOrCreatePlayer(data.player1);
    const player2 = await this.getOrCreatePlayer(data.player2);

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
    const email = playerInfo.email.toLowerCase().trim();
    const fullName = `${playerInfo.firstName} ${playerInfo.lastName}`.trim();

    // Check if user exists
    let user = await this.userRepository.findByEmail(email);
    let player = user ? await this.playerRepository.findByUserId(user.id) : null;

    // If user doesn't exist, create them
    if (!user) {
      // Generate a temporary password (user can set real one later)
      const tempPassword = `temp_${Math.random().toString(36).slice(2)}`;
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      // Create user
      user = await this.userRepository.create({
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

    // Ensure userId exists (should always be set in our flow)
    if (!player.userId) {
      throw new Error('Player created without user ID');
    }

    return player as IPlayer;
  }

  private generateAccessToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    return jwt.sign({ userId }, secret, { expiresIn: '7d' });
  }

  private generateRefreshToken(userId: string): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';
    return jwt.sign({ userId }, secret, { expiresIn: '30d' });
  }
}

