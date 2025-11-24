/**
 * Routes Setup
 * 
 * Main router configuration for Mock API
 */

import { Router } from 'express';
import { MockDataService } from '../services/data.service';
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
export function setupRoutes(db: MockDataService): Router {
  const router = Router();

  // Auth routes
  router.use('/auth', setupAuthRoutes(db));

  // User routes
  router.use('/users', setupUserRoutes(db));

  // Player routes
  router.use('/players', setupPlayerRoutes(db));

  // Match routes
  router.use('/matches', setupMatchRoutes(db));

  // Tournament routes
  router.use('/tournaments', setupTournamentRoutes(db));

  // Game type routes
  router.use('/game-types', setupGameTypeRoutes(db));

  // Statistics routes
  router.use('/stats', setupStatsRoutes(db));

  // 404 handler
  router.use(notFoundHandler);

  return router;
}

