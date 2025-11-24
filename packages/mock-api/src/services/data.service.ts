/**
 * Mock Data Service
 * 
 * In-memory database service for Mock API
 */

import { v4 as uuidv4 } from 'uuid';
import {
  IUser,
  IUserCreate,
  IPlayer,
  IPlayerCreate,
  IMatch,
  IMatchCreate,
  ITournament,
  ITournamentCreate,
  IRound,
  IRoundCreate,
  IGameType,
  IGameTypeCreate,
  ITournamentEntry,
  ITournamentEntryCreate,
  IPlayerStatistics,
} from '@rpsfull-platform/contracts';

/**
 * Mock database structure
 */
interface MockDatabase {
  users: Map<string, IUser>;
  players: Map<string, IPlayer>;
  matches: Map<string, IMatch>;
  rounds: Map<string, IRound>;
  tournaments: Map<string, ITournament>;
  tournamentEntries: Map<string, ITournamentEntry>;
  gameTypes: Map<string, IGameType>;
  playerStatistics: Map<string, IPlayerStatistics>;
}

/**
 * Mock Data Service
 * 
 * In-memory database with CRUD operations
 */
export class MockDataService {
  private data: MockDatabase;

  constructor(seedData?: Partial<MockDatabase>) {
    this.data = {
      users: new Map(),
      players: new Map(),
      matches: new Map(),
      rounds: new Map(),
      tournaments: new Map(),
      tournamentEntries: new Map(),
      gameTypes: new Map(),
      playerStatistics: new Map(),
    };

    if (seedData) {
      this.loadSeedData(seedData);
    }
  }

  /**
   * Load seed data into database
   */
  private loadSeedData(seedData: Partial<MockDatabase>): void {
    if (seedData.users) {
      seedData.users.forEach(user => this.data.users.set(user.id, user));
    }
    if (seedData.players) {
      seedData.players.forEach(player => this.data.players.set(player.id, player));
    }
    if (seedData.matches) {
      seedData.matches.forEach(match => this.data.matches.set(match.id, match));
    }
    if (seedData.rounds) {
      seedData.rounds.forEach(round => this.data.rounds.set(round.id, round));
    }
    if (seedData.tournaments) {
      seedData.tournaments.forEach(tournament => this.data.tournaments.set(tournament.id, tournament));
    }
    if (seedData.tournamentEntries) {
      seedData.tournamentEntries.forEach(entry => this.data.tournamentEntries.set(entry.id, entry));
    }
    if (seedData.gameTypes) {
      seedData.gameTypes.forEach(gameType => this.data.gameTypes.set(gameType.id, gameType));
    }
    if (seedData.playerStatistics) {
      seedData.playerStatistics.forEach(stats => this.data.playerStatistics.set(stats.id, stats));
    }
  }

  // ========== Users ==========

  createUser(data: IUserCreate): IUser {
    const user: IUser = {
      id: uuidv4(),
      email: data.email,
      passwordHash: data.passwordHash || 'mock_hash',
      role: data.role || 'player',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.users.set(user.id, user);
    return user;
  }

  getUserById(id: string): IUser | undefined {
    return this.data.users.get(id);
  }

  getUserByEmail(email: string): IUser | undefined {
    return Array.from(this.data.users.values()).find(u => u.email === email);
  }

  updateUser(id: string, updates: Partial<IUser>): IUser | undefined {
    const user = this.data.users.get(id);
    if (!user) return undefined;

    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.data.users.set(id, updated);
    return updated;
  }

  // ========== Players ==========

  createPlayer(data: IPlayerCreate): IPlayer {
    const player: IPlayer = {
      id: uuidv4(),
      userId: data.userId,
      name: data.name,
      displayName: data.displayName,
      email: data.email,
      avatarUrl: data.avatarUrl,
      bio: data.bio,
      level: 1,
      experience: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.players.set(player.id, player);
    return player;
  }

  getPlayerById(id: string): IPlayer | undefined {
    return this.data.players.get(id);
  }

  getPlayerByUserId(userId: string): IPlayer | undefined {
    return Array.from(this.data.players.values()).find(p => p.userId === userId);
  }

  searchPlayers(query: string, limit: number = 20): IPlayer[] {
    const searchLower = query.toLowerCase();
    return Array.from(this.data.players.values())
      .filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.displayName?.toLowerCase().includes(searchLower)
      )
      .slice(0, limit);
  }

  // ========== Matches ==========

  createMatch(data: IMatchCreate): IMatch {
    const match: IMatch = {
      id: uuidv4(),
      player1Id: data.player1Id,
      player2Id: data.player2Id,
      gameTypeId: data.gameTypeId,
      tournamentId: data.tournamentId,
      matchFormat: 'best_of_n',
      bestOfN: data.bestOfN,
      tiesCount: data.tiesCount || false,
      playMode: data.playMode,
      status: 'pending',
      player1Score: 0,
      player2Score: 0,
      totalRounds: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.matches.set(match.id, match);
    return match;
  }

  getMatchById(id: string): IMatch | undefined {
    return this.data.matches.get(id);
  }

  getMatchesByPlayer(playerId: string, filters?: { status?: string }): IMatch[] {
    return Array.from(this.data.matches.values()).filter(m => {
      const isPlayer = m.player1Id === playerId || m.player2Id === playerId;
      const statusMatch = !filters?.status || m.status === filters.status;
      return isPlayer && statusMatch;
    });
  }

  updateMatch(id: string, updates: Partial<IMatch>): IMatch | undefined {
    const match = this.data.matches.get(id);
    if (!match) return undefined;

    const updated = { ...match, ...updates, updatedAt: new Date() };
    this.data.matches.set(id, updated);
    return updated;
  }

  // ========== Rounds ==========

  createRound(data: IRoundCreate): IRound {
    const round: IRound = {
      id: uuidv4(),
      matchId: data.matchId,
      roundNumber: data.roundNumber,
      player1Move: data.player1Move,
      player2Move: data.player2Move,
      result: data.result,
      winnerId: data.winnerId,
      player1TimeMs: data.player1TimeMs,
      player2TimeMs: data.player2TimeMs,
      timestamp: new Date(),
    };
    this.data.rounds.set(round.id, round);
    return round;
  }

  getRoundsByMatchId(matchId: string): IRound[] {
    return Array.from(this.data.rounds.values())
      .filter(r => r.matchId === matchId)
      .sort((a, b) => a.roundNumber - b.roundNumber);
  }

  // ========== Tournaments ==========

  createTournament(data: ITournamentCreate): ITournament {
    const tournament: ITournament = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      gameTypeId: data.gameTypeId,
      organizerId: 'user-0', // Will be set by route
      tournamentType: data.tournamentType,
      matchFormat: 'best_of_n',
      bestOfN: data.bestOfN,
      status: 'draft',
      currentRound: 0,
      maxParticipants: data.maxParticipants,
      participantCount: 0,
      rules: data.rules,
      prizeInfo: data.prizeInfo,
      startDate: data.startDate,
      registrationDeadline: data.registrationDeadline,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.tournaments.set(tournament.id, tournament);
    return tournament;
  }

  getTournamentById(id: string): ITournament | undefined {
    return this.data.tournaments.get(id);
  }

  getTournaments(filters?: { status?: string }): ITournament[] {
    const tournaments = Array.from(this.data.tournaments.values());
    if (filters?.status) {
      return tournaments.filter(t => t.status === filters.status);
    }
    return tournaments;
  }

  updateTournament(id: string, updates: Partial<ITournament>): ITournament | undefined {
    const tournament = this.data.tournaments.get(id);
    if (!tournament) return undefined;

    const updated = { ...tournament, ...updates, updatedAt: new Date() };
    this.data.tournaments.set(id, updated);
    return updated;
  }

  // ========== Game Types ==========

  createGameType(data: IGameTypeCreate): IGameType {
    const gameType: IGameType = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      symbolCount: data.symbols.length,
      symbols: data.symbols,
      winMatrix: data.winMatrix,
      tieRules: data.tieRules || 'replay',
      scoringMethod: data.scoringMethod || 'best_of_n',
      isActive: true,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.data.gameTypes.set(gameType.id, gameType);
    return gameType;
  }

  getGameTypeById(id: string): IGameType | undefined {
    return this.data.gameTypes.get(id);
  }

  getGameTypes(): IGameType[] {
    return Array.from(this.data.gameTypes.values());
  }

  // ========== Tournament Entries ==========

  createTournamentEntry(data: ITournamentEntryCreate): ITournamentEntry {
    const entry: ITournamentEntry = {
      id: uuidv4(),
      tournamentId: data.tournamentId,
      playerId: data.playerId,
      seed: data.seed,
      status: 'registered',
      matchesWon: 0,
      matchesLost: 0,
      roundsWon: 0,
      roundsLost: 0,
      registeredAt: new Date(),
    };
    this.data.tournamentEntries.set(entry.id, entry);
    return entry;
  }

  getTournamentEntryByTournamentAndPlayer(
    tournamentId: string,
    playerId: string
  ): ITournamentEntry | undefined {
    return Array.from(this.data.tournamentEntries.values()).find(
      e => e.tournamentId === tournamentId && e.playerId === playerId
    );
  }

  getTournamentEntriesByTournament(tournamentId: string): ITournamentEntry[] {
    return Array.from(this.data.tournamentEntries.values()).filter(
      e => e.tournamentId === tournamentId
    );
  }

  // ========== Initialize Database ==========

  static initialize(): MockDataService {
    return new MockDataService();
  }
}

/**
 * Initialize database with seed data
 */
export function initializeDatabase(): MockDataService {
  const db = MockDataService.initialize();
  
  // Load seed data
  const { seedDatabase } = require('./seed.service');
  seedDatabase(db);
  
  return db;
}

