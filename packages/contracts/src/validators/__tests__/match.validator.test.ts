/**
 * TDD: Tests for Match Validators
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import { createMatchSchema, submitMoveSchema, recordRoundSchema } from '../match.validator';
import { PlayMode } from '../../enums';

describe('Match Validators - Complete Coverage', () => {
  describe('createMatchSchema', () => {
    const validData = {
      player2Id: 'player-123',
      gameTypeId: 'game-type-123',
      bestOfN: 3,
      playMode: PlayMode.DIGITAL,
    };

    // Happy path
    it('should validate correct match creation data', () => {
      const result = createMatchSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.player2Id).toBe('player-123');
        expect(result.data.gameTypeId).toBe('game-type-123');
        expect(result.data.bestOfN).toBe(3);
        expect(result.data.playMode).toBe(PlayMode.DIGITAL);
      }
    });

    it('should accept LIVE_RECORDING play mode', () => {
      const data = { ...validData, playMode: PlayMode.LIVE_RECORDING };
      expect(createMatchSchema.safeParse(data).success).toBe(true);
    });

    it('should accept optional tournamentId', () => {
      const data = { ...validData, tournamentId: 'tournament-123' };
      const result = createMatchSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tournamentId).toBe('tournament-123');
      }
    });

    it('should accept optional tiesCount', () => {
      const data = { ...validData, tiesCount: true };
      expect(createMatchSchema.safeParse(data).success).toBe(true);
    });

    // Error cases
    it('should reject missing player2Id', () => {
      const data = { ...validData };
      delete (data as any).player2Id;
      expect(createMatchSchema.safeParse(data).success).toBe(false);
    });

    it('should reject missing gameTypeId', () => {
      const data = { ...validData };
      delete (data as any).gameTypeId;
      expect(createMatchSchema.safeParse(data).success).toBe(false);
    });

    it('should reject invalid bestOfN (too low)', () => {
      const data = { ...validData, bestOfN: 0 };
      expect(createMatchSchema.safeParse(data).success).toBe(false);
    });

    it('should reject invalid bestOfN (too high)', () => {
      const data = { ...validData, bestOfN: 100 };
      expect(createMatchSchema.safeParse(data).success).toBe(false);
    });

    it('should reject invalid playMode', () => {
      const data = { ...validData, playMode: 'invalid_mode' };
      expect(createMatchSchema.safeParse(data).success).toBe(false);
    });

    it('should reject empty player2Id', () => {
      const data = { ...validData, player2Id: '' };
      expect(createMatchSchema.safeParse(data).success).toBe(false);
    });

    it('should reject empty gameTypeId', () => {
      const data = { ...validData, gameTypeId: '' };
      expect(createMatchSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('submitMoveSchema', () => {
    const validData = {
      roundNumber: 1,
      move: 'rock',
    };

    // Happy path
    it('should validate correct move submission', () => {
      const result = submitMoveSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.roundNumber).toBe(1);
        expect(result.data.move).toBe('rock');
      }
    });

    it('should accept optional timeTakenMs', () => {
      const data = { ...validData, timeTakenMs: 1500 };
      const result = submitMoveSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.timeTakenMs).toBe(1500);
      }
    });

    // Error cases
    it('should reject missing roundNumber', () => {
      const data = { move: 'rock' };
      expect(submitMoveSchema.safeParse(data).success).toBe(false);
    });

    it('should reject missing move', () => {
      const data = { roundNumber: 1 };
      expect(submitMoveSchema.safeParse(data).success).toBe(false);
    });

    it('should reject invalid roundNumber (too low)', () => {
      const data = { ...validData, roundNumber: 0 };
      expect(submitMoveSchema.safeParse(data).success).toBe(false);
    });

    it('should reject empty move', () => {
      const data = { ...validData, move: '' };
      expect(submitMoveSchema.safeParse(data).success).toBe(false);
    });

    it('should reject negative timeTakenMs', () => {
      const data = { ...validData, timeTakenMs: -100 };
      expect(submitMoveSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('recordRoundSchema', () => {
    const validData = {
      roundNumber: 1,
      player1Move: 'rock',
      player2Move: 'paper',
    };

    // Happy path
    it('should validate correct round recording', () => {
      const result = recordRoundSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept optional winnerId', () => {
      const data = { ...validData, winnerId: 'player-123' };
      expect(recordRoundSchema.safeParse(data).success).toBe(true);
    });

    // Error cases
    it('should reject missing roundNumber', () => {
      const data = { player1Move: 'rock', player2Move: 'paper' };
      expect(recordRoundSchema.safeParse(data).success).toBe(false);
    });

    it('should reject missing player1Move', () => {
      const data = { roundNumber: 1, player2Move: 'paper' };
      expect(recordRoundSchema.safeParse(data).success).toBe(false);
    });

    it('should reject missing player2Move', () => {
      const data = { roundNumber: 1, player1Move: 'rock' };
      expect(recordRoundSchema.safeParse(data).success).toBe(false);
    });

    it('should reject invalid roundNumber', () => {
      const data = { ...validData, roundNumber: 0 };
      expect(recordRoundSchema.safeParse(data).success).toBe(false);
    });

    it('should reject empty moves', () => {
      const data1 = { ...validData, player1Move: '' };
      const data2 = { ...validData, player2Move: '' };
      expect(recordRoundSchema.safeParse(data1).success).toBe(false);
      expect(recordRoundSchema.safeParse(data2).success).toBe(false);
    });
  });
});

