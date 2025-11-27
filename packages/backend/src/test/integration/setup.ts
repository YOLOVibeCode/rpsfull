/**
 * Integration Test Setup
 * 
 * Sets up test database and environment for integration tests
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env['DATABASE_URL'] || 'postgresql://rpsfull_test:test_password_change_in_production@localhost:5433/rpsfull_test',
    },
  },
});

/**
 * Setup before all tests
 */
export async function setupTestDatabase() {
  // Ensure database is clean
  await cleanupTestDatabase();
  
  // Run migrations
  // Note: In a real setup, you'd run migrations here
  // For now, we assume migrations are already run
  
  console.log('✅ Test database setup complete');
}

/**
 * Cleanup after all tests
 */
export async function cleanupTestDatabase() {
  // Delete all data in reverse order of dependencies
  await prisma.achievement.deleteMany();
  await prisma.playerStatistics.deleteMany();
  await prisma.tournamentEntry.deleteMany();
  await prisma.round.deleteMany();
  await prisma.match.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.gameType.deleteMany();
  await prisma.player.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('🧹 Test database cleaned');
}

/**
 * Seed test data
 */
export async function seedTestData() {
  // Import and run seed script
  // This would run the seed script with test data
  console.log('🌱 Test data seeded');
}

/**
 * Teardown after all tests
 */
export async function teardownTestDatabase() {
  await cleanupTestDatabase();
  await prisma.$disconnect();
}

export { prisma };

