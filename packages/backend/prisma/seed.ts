/**
 * Prisma Seed Script
 * 
 * Seeds the database with comprehensive test data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with test data...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.achievement.deleteMany();
  await prisma.playerStatistics.deleteMany();
  await prisma.tournamentEntry.deleteMany();
  await prisma.round.deleteMany();
  await prisma.match.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.gameType.deleteMany();
  await prisma.player.deleteMany();
  await prisma.user.deleteMany();

  // Create default password hash
  const passwordHash = await bcrypt.hash('TestPassword123!', 10);

  // Create test users
  console.log('👤 Creating test users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'rocky_rocker',
        email: 'alice@example.com',
        firstName: 'Rocky',
        lastName: 'Rocker',
        passwordHash,
        role: 'player',
        isEmailVerified: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'penny_paper',
        email: 'bob@example.com',
        firstName: 'Penny',
        lastName: 'Paper',
        passwordHash,
        role: 'player',
        isEmailVerified: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'sally_scissor',
        email: 'charlie@example.com',
        firstName: 'Sally',
        lastName: 'Scissor',
        passwordHash,
        role: 'player',
        isEmailVerified: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'lizzie_lizard',
        email: 'diana@example.com',
        firstName: 'Lizzie',
        lastName: 'Lizard',
        passwordHash,
        role: 'player',
        isEmailVerified: true,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'spock_spock',
        email: 'organizer@example.com',
        firstName: 'Spock',
        lastName: 'Spock',
        passwordHash,
        role: 'organizer',
        isEmailVerified: true,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create test players
  console.log('🎮 Creating test players...');
  const players = await Promise.all([
    prisma.player.create({
      data: {
        name: 'Rocky Rocker',
        displayName: 'Rocky',
        userId: users[0].id,
        email: 'alice@example.com',
        level: 5,
        experience: 1250,
        ranking: 1,
        bio: 'Rock Paper Scissors enthusiast',
        isActive: true,
      },
    }),
    prisma.player.create({
      data: {
        name: 'Penny Paper',
        displayName: 'Penny',
        userId: users[1].id,
        email: 'bob@example.com',
        level: 4,
        experience: 980,
        ranking: 2,
        bio: 'Competitive player',
        isActive: true,
      },
    }),
    prisma.player.create({
      data: {
        name: 'Sally Scissor',
        displayName: 'Sally',
        userId: users[2].id,
        email: 'charlie@example.com',
        level: 3,
        experience: 650,
        ranking: 3,
        bio: 'Casual player',
        isActive: true,
      },
    }),
    prisma.player.create({
      data: {
        name: 'Lizzie Lizard',
        displayName: 'Lizzie',
        userId: users[3].id,
        email: 'diana@example.com',
        level: 2,
        experience: 320,
        ranking: 4,
        bio: 'New to the game',
        isActive: true,
      },
    }),
    prisma.player.create({
      data: {
        name: 'Spock Spock',
        displayName: 'Spock',
        userId: users[4].id,
        email: 'organizer@example.com',
        level: 10,
        experience: 5000,
        ranking: null,
        bio: 'Tournament organizer',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${players.length} players`);

  // Create game types
  console.log('🎯 Creating game types...');
  const classicGameType = await prisma.gameType.upsert({
    where: { id: 'classic-rps' },
    update: {},
    create: {
      id: 'classic-rps',
      name: 'Classic Rock-Paper-Scissors',
      description: 'The classic 3-symbol game',
      symbolCount: 3,
      symbols: ['rock', 'paper', 'scissors'],
      winMatrix: {
        rock: { beats: ['scissors'], losesTo: ['paper'] },
        paper: { beats: ['rock'], losesTo: ['scissors'] },
        scissors: { beats: ['paper'], losesTo: ['rock'] },
      },
      tieRules: 'REPLAY',
      scoringMethod: 'WIN_LOSS',
      isDefault: true,
      isActive: true,
      createdBy: null,
    },
  });

  const extendedGameType = await prisma.gameType.upsert({
    where: { id: 'extended-rps' },
    update: {},
    create: {
      id: 'extended-rps',
      name: 'Extended Rock-Paper-Scissors-Lizard-Spock',
      description: 'The extended 5-symbol game from Big Bang Theory',
      symbolCount: 5,
      symbols: ['rock', 'paper', 'scissors', 'lizard', 'spock'],
      winMatrix: {
        rock: { beats: ['scissors', 'lizard'], losesTo: ['paper', 'spock'] },
        paper: { beats: ['rock', 'spock'], losesTo: ['scissors', 'lizard'] },
        scissors: { beats: ['paper', 'lizard'], losesTo: ['rock', 'spock'] },
        lizard: { beats: ['paper', 'spock'], losesTo: ['rock', 'scissors'] },
        spock: { beats: ['rock', 'scissors'], losesTo: ['paper', 'lizard'] },
      },
      tieRules: 'REPLAY',
      scoringMethod: 'WIN_LOSS',
      isDefault: false,
      isActive: true,
      createdBy: null,
    },
  });

  console.log('✅ Created game types');

  // Create test matches
  console.log('🎮 Creating test matches...');
  const now = new Date();
  const matches = [];

  // Completed matches
  for (let i = 0; i < 10; i++) {
    const player1 = players[i % players.length];
    const player2 = players[(i + 1) % players.length];
    const matchDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Spread over 10 days

    const match = await prisma.match.create({
      data: {
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: classicGameType.id,
        bestOfN: 3,
        playMode: 'digital',
        status: 'completed',
        player1Score: 2,
        player2Score: 1,
        totalRounds: 3,
        winnerId: player1.id,
        startedAt: matchDate,
        completedAt: new Date(matchDate.getTime() + 5 * 60 * 1000), // 5 minutes later
        durationSeconds: 300,
      },
    });

    // Create rounds for completed matches
    await Promise.all([
      prisma.round.create({
        data: {
          matchId: match.id,
          roundNumber: 1,
          player1Move: 'rock',
          player2Move: 'scissors',
          result: 'PLAYER1_WIN',
          winnerId: player1.id,
        },
      }),
      prisma.round.create({
        data: {
          matchId: match.id,
          roundNumber: 2,
          player1Move: 'paper',
          player2Move: 'rock',
          result: 'PLAYER1_WIN',
          winnerId: player1.id,
        },
      }),
      prisma.round.create({
        data: {
          matchId: match.id,
          roundNumber: 3,
          player1Move: 'scissors',
          player2Move: 'paper',
          result: 'PLAYER2_WIN',
          winnerId: player2.id,
        },
      }),
    ]);

    matches.push(match);
  }

  // Pending matches
  for (let i = 0; i < 3; i++) {
    const player1 = players[i % players.length];
    const player2 = players[(i + 1) % players.length];

    const match = await prisma.match.create({
      data: {
        player1Id: player1.id,
        player2Id: player2.id,
        gameTypeId: classicGameType.id,
        bestOfN: 3,
        playMode: 'digital',
        status: 'pending',
      },
    });

    matches.push(match);
  }

  console.log(`✅ Created ${matches.length} matches`);

  // Create tournaments
  console.log('🏆 Creating tournaments...');
  const organizer = users[4]; // Tournament Master (User, not Player)

  const tournament1 = await prisma.tournament.create({
    data: {
      name: 'Spring Championship 2024',
      description: 'The biggest tournament of the season',
      gameTypeId: classicGameType.id,
      organizerId: organizer.id,
      tournamentType: 'SINGLE_ELIMINATION',
      bestOfN: 3,
      status: 'REGISTRATION_OPEN',
      maxParticipants: 16,
      participantCount: 4,
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  });

  const tournament2 = await prisma.tournament.create({
    data: {
      name: 'Quick Match Tournament',
      description: 'Fast-paced single elimination',
      gameTypeId: classicGameType.id,
      organizerId: organizer.id,
      tournamentType: 'SINGLE_ELIMINATION',
      bestOfN: 1,
      status: 'IN_PROGRESS',
      maxParticipants: 8,
      participantCount: 4,
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Started yesterday
      bracketData: {
        rounds: [
          {
            roundNumber: 1,
            matches: [
              {
                id: 'match-1',
                player1Id: players[0].id,
                player1Name: players[0].displayName,
                player2Id: players[1].id,
                player2Name: players[1].displayName,
                status: 'completed',
                winnerId: players[0].id,
                player1Score: 1,
                player2Score: 0,
              },
              {
                id: 'match-2',
                player1Id: players[2].id,
                player1Name: players[2].displayName,
                player2Id: players[3].id,
                player2Name: players[3].displayName,
                status: 'completed',
                winnerId: players[2].id,
                player1Score: 1,
                player2Score: 0,
              },
            ],
          },
          {
            roundNumber: 2,
            matches: [
              {
                id: 'match-3',
                player1Id: players[0].id,
                player1Name: players[0].displayName,
                player2Id: players[2].id,
                player2Name: players[2].displayName,
                status: 'pending',
                player1Score: null,
                player2Score: null,
              },
            ],
          },
        ],
      },
    },
  });

  const tournament3 = await prisma.tournament.create({
    data: {
      name: 'Winter Classic 2023',
      description: 'Completed tournament',
      gameTypeId: classicGameType.id,
      organizerId: organizer.id,
      tournamentType: 'SINGLE_ELIMINATION',
      bestOfN: 3,
      status: 'COMPLETED',
      maxParticipants: 8,
      participantCount: 4,
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    },
  });

  console.log('✅ Created tournaments');

  // Create tournament entries
  console.log('📝 Creating tournament entries...');
  await Promise.all([
    prisma.tournamentEntry.create({
      data: {
        tournamentId: tournament1.id,
        playerId: players[0].id,
        seed: 1,
        status: 'REGISTERED',
      },
    }),
    prisma.tournamentEntry.create({
      data: {
        tournamentId: tournament1.id,
        playerId: players[1].id,
        seed: 2,
        status: 'REGISTERED',
      },
    }),
    prisma.tournamentEntry.create({
      data: {
        tournamentId: tournament1.id,
        playerId: players[2].id,
        seed: 3,
        status: 'REGISTERED',
      },
    }),
    prisma.tournamentEntry.create({
      data: {
        tournamentId: tournament1.id,
        playerId: players[3].id,
        seed: 4,
        status: 'REGISTERED',
      },
    }),
    // Tournament 2 entries
    prisma.tournamentEntry.create({
      data: {
        tournamentId: tournament2.id,
        playerId: players[0].id,
        seed: 1,
        status: 'ACTIVE',
        matchesWon: 1,
        roundsWon: 1,
      },
    }),
    prisma.tournamentEntry.create({
      data: {
        tournamentId: tournament2.id,
        playerId: players[1].id,
        seed: 2,
        status: 'ELIMINATED',
        matchesLost: 1,
        roundsLost: 1,
        eliminatedAt: new Date(),
      },
    }),
    prisma.tournamentEntry.create({
      data: {
        tournamentId: tournament2.id,
        playerId: players[2].id,
        seed: 3,
        status: 'ACTIVE',
        matchesWon: 1,
        roundsWon: 1,
      },
    }),
    prisma.tournamentEntry.create({
      data: {
        tournamentId: tournament2.id,
        playerId: players[3].id,
        seed: 4,
        status: 'ELIMINATED',
        matchesLost: 1,
        roundsLost: 1,
        eliminatedAt: new Date(),
      },
    }),
  ]);

  console.log('✅ Created tournament entries');

  // Create player statistics
  console.log('📊 Creating player statistics...');
  await Promise.all(
    players.slice(0, 4).map((player, index) =>
      prisma.playerStatistics.create({
        data: {
          playerId: player.id,
          gameTypeId: classicGameType.id,
          totalMatches: 10 + index * 2,
          matchesWon: 7 + index,
          matchesLost: 3 + index,
          matchesTied: 0,
          winRate: ((7 + index) / (10 + index * 2)) * 100,
          totalRounds: 30 + index * 6,
          roundsWon: 21 + index * 3,
          roundsLost: 9 + index * 3,
          roundsTied: 0,
          longestWinStreak: 5 + index,
          currentWinStreak: 2 + index,
          longestLossStreak: 2,
          currentLossStreak: 0,
          averageMatchDuration: 300 + index * 10,
          favoriteMove: ['rock', 'paper', 'scissors', 'rock'][index],
          lastPlayedAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000),
        },
      })
    )
  );

  console.log('✅ Created player statistics');

  // Create achievements
  console.log('🏅 Creating achievements...');
  await Promise.all([
    prisma.achievement.create({
      data: {
        playerId: players[0].id,
        achievementType: 'FIRST_WIN',
        name: 'First Victory',
        description: 'Won your first match',
        rarity: 'COMMON',
      },
    }),
    prisma.achievement.create({
      data: {
        playerId: players[0].id,
        achievementType: 'WIN_STREAK_5',
        name: 'Hot Streak',
        description: 'Won 5 matches in a row',
        rarity: 'RARE',
      },
    }),
    prisma.achievement.create({
      data: {
        playerId: players[1].id,
        achievementType: 'FIRST_WIN',
        name: 'First Victory',
        description: 'Won your first match',
        rarity: 'COMMON',
      },
    }),
  ]);

  console.log('✅ Created achievements');

  console.log('');
  console.log('✨ Seeding completed successfully!');
  console.log('');
  console.log('📝 Test Accounts:');
  console.log('  Username: rocky_rocker | Email: alice@example.com | Password: TestPassword123!');
  console.log('  Username: penny_paper | Email: bob@example.com | Password: TestPassword123!');
  console.log('  Username: sally_scissor | Email: charlie@example.com | Password: TestPassword123!');
  console.log('  Username: lizzie_lizard | Email: diana@example.com | Password: TestPassword123!');
  console.log('  Username: spock_spock | Email: organizer@example.com | Password: TestPassword123!');
  console.log('');
  console.log('🎮 Test Data Summary:');
  console.log(`  - ${users.length} users`);
  console.log(`  - ${players.length} players`);
  console.log(`  - ${matches.length} matches (${matches.filter(m => m.status === 'completed').length} completed)`);
  console.log(`  - 3 tournaments (1 open, 1 in progress, 1 completed)`);
  console.log(`  - Player statistics for ${players.slice(0, 4).length} players`);
  console.log(`  - 3 achievements`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
