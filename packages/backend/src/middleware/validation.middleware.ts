/**
 * Validation Middleware
 * 
 * Request validation using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { createError } from './errorHandler.middleware';

/**
 * Validate request body against Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(createError(`Validation error: ${message}`, 422, 'VAL_003'));
      }
      next(error);
    }
  };
}

/**
 * Validate request query against Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(createError(`Validation error: ${message}`, 422, 'VAL_003'));
      }
      next(error);
    }
  };
}

/**
 * Validate request params against Zod schema
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(createError(`Validation error: ${message}`, 422, 'VAL_003'));
      }
      next(error);
    }
  };
}

