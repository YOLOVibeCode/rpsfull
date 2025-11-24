/**
 * Test Setup
 * 
 * Global test configuration
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://rpsfull:dev_password_change_in_production@localhost:5432/rpsfull_test';

// Increase timeout for database operations
jest.setTimeout(30000);

