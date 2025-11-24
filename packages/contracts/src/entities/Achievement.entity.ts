/**
 * Achievement Entity
 * 
 * Represents player achievements and badges
 */

import { AchievementType, AchievementRarity } from '../enums';

/**
 * Achievement entity - earned achievement
 */
export interface IAchievement {
  readonly id: string;
  readonly playerId: string;
  readonly achievementType: AchievementType;
  readonly name: string;
  readonly description?: string;
  readonly iconUrl?: string;
  readonly rarity: AchievementRarity;
  readonly earnedAt: Date;
}

/**
 * Achievement definition - template for achievements
 */
export interface IAchievementDefinition {
  readonly type: AchievementType;
  readonly name: string;
  readonly description: string;
  readonly iconUrl: string;
  readonly rarity: AchievementRarity;
  readonly criteria: Record<string, unknown>;
}

