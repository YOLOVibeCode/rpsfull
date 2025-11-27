/**
 * Route Helper Utilities
 * 
 * Helper functions for route handlers
 */

import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Get authenticated user ID from request
 * Throws error if user is not authenticated
 */
export function getUserId(req: AuthenticatedRequest): string {
  if (!req.user || !req.user['id']) {
    throw new Error('User not authenticated');
  }
  return req.user['id'];
}

/**
 * Get route parameter safely
 */
export function getParam(req: { params: Record<string, string | undefined> }, key: string): string {
  const value = req.params[key];
  if (!value) {
    throw new Error(`${key} parameter is required`);
  }
  return value;
}


