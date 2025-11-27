/**
 * Player Utilities
 * 
 * Shared utility functions for player creation and management
 * Following ISP: Small, focused utility functions
 */

import { IUserRepository, IPlayerRepository, IPlayer, UserRole } from '@rpsfull-platform/contracts';
import * as bcrypt from 'bcrypt';

export interface PlayerInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export interface GetOrCreatePlayerResult {
  player: IPlayer;
  userCreated: boolean;
  playerCreated: boolean;
}

/**
 * Get or create a player from player info
 * Reusable logic for match invitations, tournament registrations, etc.
 */
export async function getOrCreatePlayer(
  playerInfo: PlayerInfo,
  userRepository: IUserRepository,
  playerRepository: IPlayerRepository
): Promise<GetOrCreatePlayerResult> {
  if (!playerInfo) {
    throw new Error(`Invalid player info: ${JSON.stringify(playerInfo)}`);
  }

  if (typeof playerInfo.email !== 'string') {
    throw new Error(`Invalid player info: ${JSON.stringify(playerInfo)}`);
  }

  const email = playerInfo.email.toLowerCase().trim();
  if (!email) {
    throw new Error('Player email cannot be empty');
  }

  const firstName = String(playerInfo.firstName || '').trim();
  const lastName = String(playerInfo.lastName || '').trim();
  const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0];

  let userCreated = false;
  let playerCreated = false;

  // Check if user exists
  let user = await userRepository.findByEmail(email);
  let player = user ? await playerRepository.findByUserId(user.id) : null;

  // If user doesn't exist, create them
  if (!user) {
    // Generate a temporary password
    const tempPassword = `temp_${Math.random().toString(36).slice(2)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Generate username from email
    const baseUsername = email.split('@')[0].replace(/[^a-z0-9]/g, '_').substring(0, 25);
    let username = baseUsername;
    let counter = 1;
    while (await userRepository.usernameExists(username)) {
      username = `${baseUsername}${counter}`.substring(0, 30);
      counter++;
    }

    // Create user
    user = await userRepository.create({
      username,
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      passwordHash,
      role: UserRole.PLAYER,
    });

    // Mark email as verified for quick join flows
    await userRepository.update(user.id, {
      isEmailVerified: true,
    });

    userCreated = true;
  }

  // Create or update player profile
  if (!player) {
    player = await playerRepository.create({
      userId: user.id,
      name: fullName,
      displayName: firstName || fullName,
      email: user.email,
    });
    playerCreated = true;
  } else {
    // Update player name if it changed
    if (player.name !== fullName) {
      await playerRepository.update(player.id, {
        name: fullName,
        displayName: firstName || fullName,
      });
      player = await playerRepository.findById(player.id);
    }
  }

  if (!player) {
    throw new Error('Failed to create or find player');
  }

  // Ensure userId exists (should always be set in our flow)
  if (!player.userId) {
    throw new Error('Player created without user ID');
  }

  return {
    player: player as IPlayer,
    userCreated,
    playerCreated,
  };
}

