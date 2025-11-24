/**
 * Game Type Entity
 * 
 * Represents a game variant (e.g., Classic RPS, RPS-LS, custom games)
 */

import { TieRule, ScoringMethod } from '../enums';

/**
 * Symbol definition within a game type
 */
export interface IGameSymbol {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly iconUrl?: string;
}

/**
 * Win matrix defining what beats what
 * Key is the symbol ID, value is array of symbol IDs it defeats
 */
export type IWinMatrix = Record<string, string[]>;

/**
 * Game type entity defining a variant of the game
 */
export interface IGameType {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly symbolCount: number;
  readonly symbols: IGameSymbol[];
  readonly winMatrix: IWinMatrix;
  readonly tieRules: TieRule;
  readonly scoringMethod: ScoringMethod;
  readonly iconSet?: Record<string, string>;
  readonly isActive: boolean;
  readonly isDefault: boolean;
  readonly createdBy?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Data for creating a new game type
 */
export interface IGameTypeCreate {
  name: string;
  description?: string;
  symbols: IGameSymbol[];
  winMatrix: IWinMatrix;
  tieRules?: TieRule;
  scoringMethod?: ScoringMethod;
}

/**
 * Data for updating an existing game type
 */
export interface IGameTypeUpdate {
  name?: string;
  description?: string;
  symbols?: IGameSymbol[];
  winMatrix?: IWinMatrix;
  tieRules?: TieRule;
  scoringMethod?: ScoringMethod;
  isActive?: boolean;
}

/**
 * Public game type data - safe to expose in API responses
 */
export interface IGameTypePublic {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly symbolCount: number;
  readonly symbols: IGameSymbol[];
  readonly winMatrix: IWinMatrix;
  readonly isDefault: boolean;
}

