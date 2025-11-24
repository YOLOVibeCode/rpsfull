/**
 * TDD: Tests for Enumerations
 * 
 * Following TDD methodology:
 * 1. 🔴 RED: Write failing tests first
 * 2. 🟢 GREEN: Implement to make tests pass
 * 3. 🔵 REFACTOR: Improve while keeping tests green
 */

import {
  UserRole,
  MatchStatus,
  PlayMode,
  RoundResult,
  TournamentType,
  TournamentStatus,
  TournamentEntryStatus,
  TieRule,
  ScoringMethod,
  AchievementType,
  AchievementRarity,
  GameVisibility,
  DifficultyLevel,
  ValidationErrorType,
} from '../index';

describe('Enumerations - Complete Coverage', () => {
  describe('UserRole', () => {
    it('should have PLAYER value', () => {
      expect(UserRole.PLAYER).toBe('player');
    });

    it('should have ORGANIZER value', () => {
      expect(UserRole.ORGANIZER).toBe('organizer');
    });

    it('should have ADMIN value', () => {
      expect(UserRole.ADMIN).toBe('admin');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(UserRole);
      expect(values).toHaveLength(3);
      expect(values).toEqual(['player', 'organizer', 'admin']);
    });

    it('should be usable as a type', () => {
      const role: UserRole = UserRole.PLAYER;
      expect(role).toBe('player');
    });
  });

  describe('MatchStatus', () => {
    it('should have PENDING value', () => {
      expect(MatchStatus.PENDING).toBe('pending');
    });

    it('should have IN_PROGRESS value', () => {
      expect(MatchStatus.IN_PROGRESS).toBe('in_progress');
    });

    it('should have COMPLETED value', () => {
      expect(MatchStatus.COMPLETED).toBe('completed');
    });

    it('should have CANCELLED value', () => {
      expect(MatchStatus.CANCELLED).toBe('cancelled');
    });

    it('should have exactly 4 values', () => {
      const values = Object.values(MatchStatus);
      expect(values).toHaveLength(4);
      expect(values).toEqual(['pending', 'in_progress', 'completed', 'cancelled']);
    });
  });

  describe('PlayMode', () => {
    it('should have DIGITAL value', () => {
      expect(PlayMode.DIGITAL).toBe('digital');
    });

    it('should have LIVE_RECORDING value', () => {
      expect(PlayMode.LIVE_RECORDING).toBe('live_recording');
    });

    it('should have exactly 2 values', () => {
      const values = Object.values(PlayMode);
      expect(values).toHaveLength(2);
      expect(values).toEqual(['digital', 'live_recording']);
    });
  });

  describe('RoundResult', () => {
    it('should have PLAYER1_WIN value', () => {
      expect(RoundResult.PLAYER1_WIN).toBe('player1_win');
    });

    it('should have PLAYER2_WIN value', () => {
      expect(RoundResult.PLAYER2_WIN).toBe('player2_win');
    });

    it('should have TIE value', () => {
      expect(RoundResult.TIE).toBe('tie');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(RoundResult);
      expect(values).toHaveLength(3);
      expect(values).toEqual(['player1_win', 'player2_win', 'tie']);
    });
  });

  describe('TournamentType', () => {
    it('should have SINGLE_ELIMINATION value', () => {
      expect(TournamentType.SINGLE_ELIMINATION).toBe('single_elimination');
    });

    it('should have DOUBLE_ELIMINATION value', () => {
      expect(TournamentType.DOUBLE_ELIMINATION).toBe('double_elimination');
    });

    it('should have ROUND_ROBIN value', () => {
      expect(TournamentType.ROUND_ROBIN).toBe('round_robin');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(TournamentType);
      expect(values).toHaveLength(3);
      expect(values).toEqual(['single_elimination', 'double_elimination', 'round_robin']);
    });
  });

  describe('TournamentStatus', () => {
    it('should have DRAFT value', () => {
      expect(TournamentStatus.DRAFT).toBe('draft');
    });

    it('should have REGISTRATION value', () => {
      expect(TournamentStatus.REGISTRATION).toBe('registration');
    });

    it('should have READY value', () => {
      expect(TournamentStatus.READY).toBe('ready');
    });

    it('should have IN_PROGRESS value', () => {
      expect(TournamentStatus.IN_PROGRESS).toBe('in_progress');
    });

    it('should have COMPLETED value', () => {
      expect(TournamentStatus.COMPLETED).toBe('completed');
    });

    it('should have CANCELLED value', () => {
      expect(TournamentStatus.CANCELLED).toBe('cancelled');
    });

    it('should have exactly 6 values', () => {
      const values = Object.values(TournamentStatus);
      expect(values).toHaveLength(6);
      expect(values).toEqual([
        'draft',
        'registration',
        'ready',
        'in_progress',
        'completed',
        'cancelled',
      ]);
    });
  });

  describe('TournamentEntryStatus', () => {
    it('should have REGISTERED value', () => {
      expect(TournamentEntryStatus.REGISTERED).toBe('registered');
    });

    it('should have ACTIVE value', () => {
      expect(TournamentEntryStatus.ACTIVE).toBe('active');
    });

    it('should have ELIMINATED value', () => {
      expect(TournamentEntryStatus.ELIMINATED).toBe('eliminated');
    });

    it('should have WITHDREW value', () => {
      expect(TournamentEntryStatus.WITHDREW).toBe('withdrew');
    });

    it('should have exactly 4 values', () => {
      const values = Object.values(TournamentEntryStatus);
      expect(values).toHaveLength(4);
      expect(values).toEqual(['registered', 'active', 'eliminated', 'withdrew']);
    });
  });

  describe('TieRule', () => {
    it('should have REPLAY value', () => {
      expect(TieRule.REPLAY).toBe('replay');
    });

    it('should have COUNT value', () => {
      expect(TieRule.COUNT).toBe('count');
    });

    it('should have IGNORE value', () => {
      expect(TieRule.IGNORE).toBe('ignore');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(TieRule);
      expect(values).toHaveLength(3);
      expect(values).toEqual(['replay', 'count', 'ignore']);
    });
  });

  describe('ScoringMethod', () => {
    it('should have BEST_OF_N value', () => {
      expect(ScoringMethod.BEST_OF_N).toBe('best_of_n');
    });

    it('should have POINTS value', () => {
      expect(ScoringMethod.POINTS).toBe('points');
    });

    it('should have exactly 2 values', () => {
      const values = Object.values(ScoringMethod);
      expect(values).toHaveLength(2);
      expect(values).toEqual(['best_of_n', 'points']);
    });
  });

  describe('AchievementType', () => {
    it('should have MATCHES_WON value', () => {
      expect(AchievementType.MATCHES_WON).toBe('matches_won');
    });

    it('should have TOURNAMENTS_WON value', () => {
      expect(AchievementType.TOURNAMENTS_WON).toBe('tournaments_won');
    });

    it('should have STREAK value', () => {
      expect(AchievementType.STREAK).toBe('streak');
    });

    it('should have MILESTONE value', () => {
      expect(AchievementType.MILESTONE).toBe('milestone');
    });

    it('should have SPECIAL value', () => {
      expect(AchievementType.SPECIAL).toBe('special');
    });
  });

  describe('AchievementRarity', () => {
    it('should have COMMON value', () => {
      expect(AchievementRarity.COMMON).toBe('common');
    });

    it('should have RARE value', () => {
      expect(AchievementRarity.RARE).toBe('rare');
    });

    it('should have EPIC value', () => {
      expect(AchievementRarity.EPIC).toBe('epic');
    });

    it('should have LEGENDARY value', () => {
      expect(AchievementRarity.LEGENDARY).toBe('legendary');
    });

    it('should have exactly 4 values', () => {
      const values = Object.values(AchievementRarity);
      expect(values).toHaveLength(4);
      expect(values).toEqual(['common', 'rare', 'epic', 'legendary']);
    });
  });

  describe('GameVisibility', () => {
    it('should have PRIVATE value', () => {
      expect(GameVisibility.PRIVATE).toBe('private');
    });

    it('should have UNLISTED value', () => {
      expect(GameVisibility.UNLISTED).toBe('unlisted');
    });

    it('should have PUBLIC value', () => {
      expect(GameVisibility.PUBLIC).toBe('public');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(GameVisibility);
      expect(values).toHaveLength(3);
      expect(values).toEqual(['private', 'unlisted', 'public']);
    });
  });

  describe('DifficultyLevel', () => {
    it('should have BEGINNER value', () => {
      expect(DifficultyLevel.BEGINNER).toBe('beginner');
    });

    it('should have INTERMEDIATE value', () => {
      expect(DifficultyLevel.INTERMEDIATE).toBe('intermediate');
    });

    it('should have ADVANCED value', () => {
      expect(DifficultyLevel.ADVANCED).toBe('advanced');
    });

    it('should have exactly 3 values', () => {
      const values = Object.values(DifficultyLevel);
      expect(values).toHaveLength(3);
      expect(values).toEqual(['beginner', 'intermediate', 'advanced']);
    });
  });

  describe('ValidationErrorType', () => {
    it('should have INVALID_SYMBOL_COUNT value', () => {
      expect(ValidationErrorType.INVALID_SYMBOL_COUNT).toBe('invalid_symbol_count');
    });

    it('should have INVALID_WIN_MATRIX value', () => {
      expect(ValidationErrorType.INVALID_WIN_MATRIX).toBe('invalid_win_matrix');
    });

    it('should have UNBALANCED_MATRIX value', () => {
      expect(ValidationErrorType.UNBALANCED_MATRIX).toBe('unbalanced_matrix');
    });

    it('should have MISSING_SYMBOL value', () => {
      expect(ValidationErrorType.MISSING_SYMBOL).toBe('missing_symbol');
    });

    it('should have DUPLICATE_SYMBOL value', () => {
      expect(ValidationErrorType.DUPLICATE_SYMBOL).toBe('duplicate_symbol');
    });
  });
});

