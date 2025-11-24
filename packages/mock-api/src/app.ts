/**
 * Mock API Application
 * 
 * Express application setup for Mock API server
 */

import express, { Express } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.middleware';
import { setupRoutes } from './routes';
import { MockDataService } from './services/data.service';

/**
 * Create Express application
 */
export function createApp(db: MockDataService): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging (simple)
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/v1', setupRoutes(db));

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}

