/**
 * Seed Data Service
 * 
 * Generates realistic seed data for Mock API
 */

import { MockDataService } from './data.service';
import {
  IUser,
  IPlayer,
  IGameType,
  UserRole,
  TieRule,
  ScoringMethod,
} from '@rpsfull-platform/contracts';

/**
 * Generate seed data
 */
export function generateSeedData(): {
  users: IUser[];
  players: IPlayer[];
  gameTypes: IGameType[];
} {
  // Generate users
  const users: IUser[] = Array.from({ length: 20 }, (_, i) => ({
    id: `user-${i}`,
    email: `user${i}@example.com`,
    passwordHash: 'mock_hash',
    role: i === 0 ? UserRole.ADMIN : i < 5 ? UserRole.ORGANIZER : UserRole.PLAYER,
    isEmailVerified: true,
    isActive: true,
    createdAt: new Date(Date.now() - i * 86400000),
    updatedAt: new Date(),
  }));

  // Generate players
  const players: IPlayer[] = users.map((user, i) => ({
    id: `player-${i}`,
    userId: user.id,
    name: `Player ${i + 1}`,
    displayName: `Player${i + 1}`,
    email: user.email,
    level: Math.floor(Math.random() * 50) + 1,
    experience: Math.floor(Math.random() * 10000),
    ranking: i + 1,
    isActive: true,
    createdAt: user.createdAt,
    updatedAt: new Date(),
  }));

  // Generate game types
  const gameTypes: IGameType[] = [
    {
      id: 'classic-rps',
      name: 'Classic RPS',
      description: 'Traditional Rock, Paper, Scissors',
      symbolCount: 3,
      symbols: [
        { id: 'rock', name: 'Rock', emoji: '🪨', displayOrder: 0 },
        { id: 'paper', name: 'Paper', emoji: '📄', displayOrder: 1 },
        { id: 'scissors', name: 'Scissors', emoji: '✂️', displayOrder: 2 },
      ],
      winMatrix: {
        rock: ['scissors'],
        paper: ['rock'],
        scissors: ['paper'],
      },
      tieRules: TieRule.REPLAY,
      scoringMethod: ScoringMethod.BEST_OF_N,
      isActive: true,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'rps-ls',
      name: 'Rock Paper Scissors Lizard Spock',
      description: 'Extended version with 5 symbols',
      symbolCount: 5,
      symbols: [
        { id: 'rock', name: 'Rock', emoji: '🪨', displayOrder: 0 },
        { id: 'paper', name: 'Paper', emoji: '📄', displayOrder: 1 },
        { id: 'scissors', name: 'Scissors', emoji: '✂️', displayOrder: 2 },
        { id: 'lizard', name: 'Lizard', emoji: '🦎', displayOrder: 3 },
        { id: 'spock', name: 'Spock', emoji: '🖖', displayOrder: 4 },
      ],
      winMatrix: {
        rock: ['scissors', 'lizard'],
        paper: ['rock', 'spock'],
        scissors: ['paper', 'lizard'],
        lizard: ['paper', 'spock'],
        spock: ['rock', 'scissors'],
      },
      tieRules: TieRule.REPLAY,
      scoringMethod: ScoringMethod.BEST_OF_N,
      isActive: true,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return { users, players, gameTypes };
}

/**
 * Seed database with initial data
 */
export function seedDatabase(db: MockDataService): void {
  const seedData = generateSeedData();

  // Add users
  seedData.users.forEach(user => {
    db['data'].users.set(user.id, user);
  });

  // Add players
  seedData.players.forEach(player => {
    db['data'].players.set(player.id, player);
  });

  // Add game types
  seedData.gameTypes.forEach(gameType => {
    db['data'].gameTypes.set(gameType.id, gameType);
  });

  console.log(`✅ Seeded database with ${seedData.users.length} users, ${seedData.players.length} players, ${seedData.gameTypes.length} game types`);
}

