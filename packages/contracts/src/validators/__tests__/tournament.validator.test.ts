/**
 * TDD: Tests for Tournament Validators
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import { createTournamentSchema, registerTournamentSchema } from '../tournament.validator';
import { TournamentType } from '../../enums';

describe('Tournament Validators - Complete Coverage', () => {
  describe('createTournamentSchema', () => {
    const validData = {
      name: 'Test Tournament',
      gameTypeId: 'game-type-123',
      tournamentType: TournamentType.SINGLE_ELIMINATION,
      bestOfN: 3,
    };

    // Happy path
    it('should validate correct tournament creation data', () => {
      const result = createTournamentSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Test Tournament');
        expect(result.data.tournamentType).toBe(TournamentType.SINGLE_ELIMINATION);
      }
    });

    it('should accept all tournament types', () => {
      const types = [
        TournamentType.SINGLE_ELIMINATION,
        TournamentType.DOUBLE_ELIMINATION,
        TournamentType.ROUND_ROBIN,
      ];

      types.forEach(type => {
        const data = { ...validData, tournamentType: type };
        expect(createTournamentSchema.safeParse(data).success).toBe(true);
      });
    });

    it('should accept optional description', () => {
      const data = { ...validData, description: 'A great tournament' };
      expect(createTournamentSchema.safeParse(data).success).toBe(true);
    });

    it('should accept optional maxParticipants', () => {
      const data = { ...validData, maxParticipants: 16 };
      expect(createTournamentSchema.safeParse(data).success).toBe(true);
    });

    it('should accept optional dates', () => {
      const data = {
        ...validData,
        startDate: new Date('2025-12-01'),
        registrationDeadline: new Date('2025-11-30'),
      };
      expect(createTournamentSchema.safeParse(data).success).toBe(true);
    });

    // Error cases
    it('should reject missing name', () => {
      const data = { ...validData };
      delete (data as any).name;
      expect(createTournamentSchema.safeParse(data).success).toBe(false);
    });

    it('should reject missing gameTypeId', () => {
      const data = { ...validData };
      delete (data as any).gameTypeId;
      expect(createTournamentSchema.safeParse(data).success).toBe(false);
    });

    it('should reject missing tournamentType', () => {
      const data = { ...validData };
      delete (data as any).tournamentType;
      expect(createTournamentSchema.safeParse(data).success).toBe(false);
    });

    it('should reject short name', () => {
      const data = { ...validData, name: 'A' };
      expect(createTournamentSchema.safeParse(data).success).toBe(false);
    });

    it('should reject long name', () => {
      const data = { ...validData, name: 'A'.repeat(201) };
      expect(createTournamentSchema.safeParse(data).success).toBe(false);
    });

    it('should reject invalid bestOfN', () => {
      const data1 = { ...validData, bestOfN: 0 };
      const data2 = { ...validData, bestOfN: 100 };
      expect(createTournamentSchema.safeParse(data1).success).toBe(false);
      expect(createTournamentSchema.safeParse(data2).success).toBe(false);
    });

    it('should reject invalid maxParticipants', () => {
      const data = { ...validData, maxParticipants: 0 };
      expect(createTournamentSchema.safeParse(data).success).toBe(false);
    });

    it('should reject invalid tournamentType', () => {
      const data = { ...validData, tournamentType: 'invalid_type' };
      expect(createTournamentSchema.safeParse(data).success).toBe(false);
    });
  });

  describe('registerTournamentSchema', () => {
    // Happy path
    it('should validate tournament registration', () => {
      const data = {};
      const result = registerTournamentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept optional seed', () => {
      const data = { seed: 5 };
      const result = registerTournamentSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.seed).toBe(5);
      }
    });

    // Error cases
    it('should reject negative seed', () => {
      const data = { seed: -1 };
      expect(registerTournamentSchema.safeParse(data).success).toBe(false);
    });

    it('should reject zero seed', () => {
      const data = { seed: 0 };
      expect(registerTournamentSchema.safeParse(data).success).toBe(false);
    });
  });
});

