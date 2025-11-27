/**
 * Express Application Setup
 * 
 * Main Express app configuration
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.middleware';
import { setupRoutes } from './routes';

/**
 * Create Express application
 */
export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env['CORS_ORIGIN'] || '*',
      credentials: true,
    })
  );

  // Rate limiting (disabled in test mode)
  const isTestMode = process.env.NODE_ENV === 'test' || 
                     process.env.TEST_MODE === 'true' || 
                     process.env.TEST_MODE === '1' ||
                     process.env.PLAYWRIGHT === 'true';
  
  if (!isTestMode) {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });
    app.use('/api/', limiter);
  } else {
    console.log('⚠️  Rate limiting DISABLED (test mode detected)');
  }

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API routes
  app.use('/api/v1', setupRoutes());

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}

