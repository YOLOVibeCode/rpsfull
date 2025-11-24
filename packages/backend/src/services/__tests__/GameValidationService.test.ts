/**
 * TDD: Tests for GameValidationService
 */

import { PrismaClient } from '@prisma/client';
import { GameValidationService } from '../GameValidationService';
import { IGameTypeCreate, TieRule, ScoringMethod, ValidationErrorType } from '@rpsfull-platform/contracts';

describe('GameValidationService - Complete Coverage', () => {
  let validationService: GameValidationService;

  beforeAll(() => {
    validationService = new GameValidationService();
  });

  describe('validateGameType', () => {
    it('should validate valid game type', async () => {
      const gameType: IGameTypeCreate = {
        name: 'Valid RPS',
        symbolCount: 3,
        symbols: [
          { id: 'rock', name: 'Rock', emoji: '🪨' },
          { id: 'paper', name: 'Paper', emoji: '📄' },
          { id: 'scissors', name: 'Scissors', emoji: '✂️' },
        ],
        winMatrix: {
          rock: ['scissors'],
          paper: ['rock'],
          scissors: ['paper'],
        },
        tieRules: TieRule.REPLAY,
        scoringMethod: ScoringMethod.BEST_OF_N,
      };

      const result = await validationService.validateGameType(gameType);

      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject invalid symbol count (even number)', async () => {
      const gameType: IGameTypeCreate = {
        name: 'Invalid',
        symbolCount: 4,
        symbols: [
          { id: 'a', name: 'A', emoji: '🅰️' },
          { id: 'b', name: 'B', emoji: '🅱️' },
          { id: 'c', name: 'C', emoji: '©️' },
          { id: 'd', name: 'D', emoji: '🅿️' },
        ],
        winMatrix: {},
      };

      const result = await validationService.validateGameType(gameType);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.type === ValidationErrorType.INVALID_SYMBOL_COUNT)).toBe(
        true
      );
    });

    it('should reject invalid win matrix', async () => {
      const gameType: IGameTypeCreate = {
        name: 'Invalid Matrix',
        symbolCount: 3,
        symbols: [
          { id: 'rock', name: 'Rock', emoji: '🪨' },
          { id: 'paper', name: 'Paper', emoji: '📄' },
          { id: 'scissors', name: 'Scissors', emoji: '✂️' },
        ],
        winMatrix: {
          rock: ['invalid_symbol'],
        },
      };

      const result = await validationService.validateGameType(gameType);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('checkMatrixBalance', () => {
    it('should calculate balance score for balanced matrix', async () => {
      const winMatrix = {
        rock: ['scissors'],
        paper: ['rock'],
        scissors: ['paper'],
      };

      const score = await validationService.checkMatrixBalance(winMatrix, 3);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('validateSymbolCount', () => {
    it('should return true for odd number', () => {
      expect(validationService.validateSymbolCount(3)).toBe(true);
      expect(validationService.validateSymbolCount(5)).toBe(true);
      expect(validationService.validateSymbolCount(7)).toBe(true);
    });

    it('should return false for even number', () => {
      expect(validationService.validateSymbolCount(2)).toBe(false);
      expect(validationService.validateSymbolCount(4)).toBe(false);
      expect(validationService.validateSymbolCount(6)).toBe(false);
    });
  });

  describe('validateWinMatrix', () => {
    it('should validate correct win matrix', async () => {
      const symbolIds = ['rock', 'paper', 'scissors'];
      const winMatrix = {
        rock: ['scissors'],
        paper: ['rock'],
        scissors: ['paper'],
      };

      const errors = await validationService.validateWinMatrix(winMatrix, symbolIds);

      expect(errors.length).toBe(0);
    });

    it('should detect missing symbols in matrix', async () => {
      const symbolIds = ['rock', 'paper', 'scissors'];
      const winMatrix = {
        rock: ['scissors'],
        paper: ['rock'],
        // Missing scissors
      };

      const errors = await validationService.validateWinMatrix(winMatrix, symbolIds);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should detect duplicate symbols', async () => {
      const symbolIds = ['rock', 'paper', 'scissors'];
      const winMatrix = {
        rock: ['scissors', 'scissors'], // Duplicate
        paper: ['rock'],
        scissors: ['paper'],
      };

      const errors = await validationService.validateWinMatrix(winMatrix, symbolIds);

      expect(errors.some(e => e.type === ValidationErrorType.DUPLICATE_SYMBOL)).toBe(true);
    });
  });
});

