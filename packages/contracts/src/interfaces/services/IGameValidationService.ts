/**
 * Game Validation Service Interface
 * 
 * ISP: Small, focused interface for game type validation only
 */

import { IGameTypeCreate } from '../../entities/GameType.entity';
import { ValidationErrorType } from '../../enums';

/**
 * Validation error
 */
export interface IValidationError {
  type: ValidationErrorType;
  message: string;
  severity: 'error' | 'warning';
  symbolId?: string;
}

/**
 * Validation result
 */
export interface IGameValidationResult {
  isValid: boolean;
  errors: IValidationError[];
  warnings: IValidationError[];
  balanceScore: number;
}

/**
 * Game validation service interface
 * Focused only on game type validation
 */
export interface IGameValidationService {
  /**
   * Validate a game type configuration
   */
  validateGameType(gameType: IGameTypeCreate): Promise<IGameValidationResult>;

  /**
   * Check if win matrix is balanced
   */
  checkMatrixBalance(winMatrix: Record<string, string[]>, symbolCount: number): Promise<number>;

  /**
   * Validate symbol count (must be odd)
   */
  validateSymbolCount(symbolCount: number): boolean;

  /**
   * Validate win matrix structure
   */
  validateWinMatrix(winMatrix: Record<string, string[]>, symbolIds: string[]): Promise<IValidationError[]>;
}

