/**
 * Game Validation Service
 * 
 * Implements IGameValidationService interface
 * Following ISP: Small, focused interface for game validation only
 */

import {
  IGameValidationService,
  IGameTypeCreate,
  IGameValidationResult,
  IValidationError,
  ValidationErrorType,
} from '@rpsfull-platform/contracts';

export class GameValidationService implements IGameValidationService {
  async validateGameType(gameType: IGameTypeCreate): Promise<IGameValidationResult> {
    const errors: IValidationError[] = [];
    const warnings: IValidationError[] = [];

    // Validate symbol count (must be odd)
    if (!this.validateSymbolCount(gameType.symbolCount)) {
      errors.push({
        type: ValidationErrorType.INVALID_SYMBOL_COUNT,
        message: 'Symbol count must be an odd number',
        severity: 'error',
      });
    }

    // Validate symbols match count
    if (gameType.symbols.length !== gameType.symbolCount) {
      errors.push({
        type: ValidationErrorType.INVALID_SYMBOL_COUNT,
        message: `Expected ${gameType.symbolCount} symbols but got ${gameType.symbols.length}`,
        severity: 'error',
      });
    }

    // Validate win matrix
    const matrixErrors = await this.validateWinMatrix(
      gameType.winMatrix,
      gameType.symbols.map(s => s.id)
    );
    errors.push(...matrixErrors.filter(e => e.severity === 'error'));
    warnings.push(...matrixErrors.filter(e => e.severity === 'warning'));

    // Check balance
    const balanceScore = await this.checkMatrixBalance(
      gameType.winMatrix,
      gameType.symbolCount
    );

    if (balanceScore < 70) {
      warnings.push({
        type: ValidationErrorType.UNBALANCED_MATRIX,
        message: `Game matrix is unbalanced (score: ${balanceScore})`,
        severity: 'warning',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      balanceScore,
    };
  }

  async checkMatrixBalance(
    winMatrix: Record<string, string[]>,
    symbolCount: number
  ): Promise<number> {
    const symbolIds = Object.keys(winMatrix);
    const defeatsCount: Record<string, number> = {};

    // Count how many times each symbol is defeated
    for (const [symbol, defeats] of Object.entries(winMatrix)) {
      for (const defeated of defeats) {
        defeatsCount[defeated] = (defeatsCount[defeated] || 0) + 1;
      }
    }

    // Calculate balance score
    const expectedDefeats = (symbolCount - 1) / 2;
    let totalDeviation = 0;

    for (const symbolId of symbolIds) {
      const defeats = defeatsCount[symbolId] || 0;
      const deviation = Math.abs(defeats - expectedDefeats);
      totalDeviation += deviation;
    }

    const maxDeviation = symbolIds.length * expectedDefeats;
    const balanceScore = Math.max(0, 100 - (totalDeviation / maxDeviation) * 100);

    return Math.round(balanceScore);
  }

  validateSymbolCount(symbolCount: number): boolean {
    return symbolCount > 0 && symbolCount % 2 === 1;
  }

  async validateWinMatrix(
    winMatrix: Record<string, string[]>,
    symbolIds: string[]
  ): Promise<IValidationError[]> {
    const errors: IValidationError[] = [];

    // Check all symbols are in matrix
    for (const symbolId of symbolIds) {
      if (!(symbolId in winMatrix)) {
        errors.push({
          type: ValidationErrorType.MISSING_SYMBOL,
          message: `Symbol ${symbolId} missing from win matrix`,
          severity: 'error',
          symbolId,
        });
      }
    }

    // Check matrix keys are valid symbols
    for (const symbolId of Object.keys(winMatrix)) {
      if (!symbolIds.includes(symbolId)) {
        errors.push({
          type: ValidationErrorType.INVALID_WIN_MATRIX,
          message: `Invalid symbol ${symbolId} in win matrix`,
          severity: 'error',
          symbolId,
        });
      }
    }

    // Check defeated symbols are valid
    for (const [symbolId, defeats] of Object.entries(winMatrix)) {
      for (const defeated of defeats) {
        if (!symbolIds.includes(defeated)) {
          errors.push({
            type: ValidationErrorType.INVALID_WIN_MATRIX,
            message: `Invalid defeated symbol ${defeated} for ${symbolId}`,
            severity: 'error',
            symbolId,
          });
        }
      }

      // Check for duplicates
      const uniqueDefeats = new Set(defeats);
      if (uniqueDefeats.size !== defeats.length) {
        errors.push({
          type: ValidationErrorType.DUPLICATE_SYMBOL,
          message: `Duplicate symbols in defeats for ${symbolId}`,
          severity: 'error',
          symbolId,
        });
      }
    }

    return errors;
  }
}

