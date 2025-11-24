/**
 * Authentication Middleware
 * 
 * Mock authentication for Mock API
 */

import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler.middleware';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Mock authentication middleware
 * 
 * In real implementation, this would verify JWT tokens
 * For Mock API, we accept simple token format: "user-{id}"
 */
export function mockAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('Missing or invalid authorization header', 401, 'AUTH_001'));
  }

  const token = authHeader.substring(7);

  // Mock token validation
  // Token format: "user-{id}" or just accept any token for development
  if (token.startsWith('user-')) {
    const userId = token.replace('user-', '');
    req.user = {
      id: userId,
      email: `user${userId}@example.com`,
      role: 'player',
    };
    return next();
  }

  // Default user for development (accept any token)
  req.user = {
    id: 'user-0',
    email: 'user0@example.com',
    role: 'admin',
  };

  next();
}

