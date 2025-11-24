/**
 * Routes Setup
 * 
 * Main router configuration for Backend API
 */

import { Router } from 'express';
import { setupAuthRoutes } from './auth.routes';
import { setupUserRoutes } from './user.routes';
import { setupPlayerRoutes } from './player.routes';
import { setupMatchRoutes } from './match.routes';
import { setupTournamentRoutes } from './tournament.routes';
import { setupGameTypeRoutes } from './gameType.routes';
import { setupStatsRoutes } from './stats.routes';
import { notFoundHandler } from '../middleware/errorHandler.middleware';

/**
 * Setup all routes
 */
export function setupRoutes(): Router {
  const router = Router();

  // Auth routes
  router.use('/auth', setupAuthRoutes());

  // User routes
  router.use('/users', setupUserRoutes());

  // Player routes
  router.use('/players', setupPlayerRoutes());

  // Match routes
  router.use('/matches', setupMatchRoutes());

  // Tournament routes
  router.use('/tournaments', setupTournamentRoutes());

  // Game type routes
  router.use('/game-types', setupGameTypeRoutes());

  // Statistics routes
  router.use('/stats', setupStatsRoutes());

  // 404 handler
  router.use(notFoundHandler);

  return router;
}

