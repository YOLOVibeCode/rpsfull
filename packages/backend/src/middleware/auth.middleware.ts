/**
 * Authentication Middleware
 * 
 * JWT token verification for protected routes
 */

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { createError } from './errorHandler.middleware';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError('Missing or invalid authorization header', 401, 'AUTH_001'));
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(
      token,
      process.env['JWT_SECRET'] || 'secret'
    ) as { userId: string; email?: string; role?: string };

    req.user = {
      id: decoded.userId,
      email: decoded.email || '',
      role: decoded.role || 'player',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(createError('Token expired', 401, 'AUTH_002'));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('Invalid token', 401, 'AUTH_003'));
    }
    return next(createError('Authentication failed', 401, 'AUTH_001'));
  }
}

