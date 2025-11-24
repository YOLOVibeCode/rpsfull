/**
 * TDD: Tests for MatchGameplayService
 * 
 * ISP: Separated gameplay operations from match management
 */

import { PrismaClient } from '@prisma/client';
import { MatchGameplayService } from '../MatchGameplayService';
import { MatchRepository } from '../../repositories/MatchRepository';
import { RoundRepository } from '../../repositories/RoundRepository';
import { PlayerRepository } from '../../repositories/PlayerRepository';
import { GameTypeRepository } from '../../repositories/GameTypeRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { ISubmitMoveDto, IRecordRoundDto, RoundResult, MatchStatus, PlayMode } from '@rpsfull-platform/contracts';

describe('MatchGameplayService - Complete Coverage', () => {
  let prisma: PrismaClient;
  let matchRepository: MatchRepository;
  let roundRepository: RoundRepository;
  let gameplayService: MatchGameplayService;
  let match: any;
  let player1: any;
  let player2: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    matchRepository = new MatchRepository(prisma);
    roundRepository = new RoundRepository(prisma);
    gameplayService = new MatchGameplayService(matchRepository, roundRepository);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.round.deleteMany({});
    await prisma.match.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    const user1 = await new UserRepository(prisma).create({
      email: 'p1@test.com',
      passwordHash: 'hash',
    });
    const user2 = await new UserRepository(prisma).create({
      email: 'p2@test.com',
      passwordHash: 'hash',
    });

    player1 = await new PlayerRepository(prisma).create({
      userId: user1.id,
      name: 'Player 1',
      email: 'p1@test.com',
    });

    player2 = await new PlayerRepository(prisma).create({
      userId: user2.id,
      name: 'Player 2',
      email: 'p2@test.com',
    });

    const gameType = await new GameTypeRepository(prisma).create({
      name: 'Test RPS',
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
    });

    match = await matchRepository.create({
      player1Id: player1.id,
      player2Id: player2.id,
      gameTypeId: gameType.id,
      bestOfN: 3,
      playMode: PlayMode.DIGITAL,
    });

    await matchRepository.update(match.id, { status: MatchStatus.IN_PROGRESS });
  });

  describe('submitMove', () => {
    it('should submit a move and create round', async () => {
      const data: ISubmitMoveDto = {
        roundNumber: 1,
        move: 'rock',
        timeTakenMs: 1500,
      };

      const result = await gameplayService.submitMove(match.id, player1.id, data);

      expect(result).toBeDefined();
      expect(result.roundNumber).toBe(1);
      expect(result.yourMove).toBe('rock');
    });

    it('should throw error if match not found', async () => {
      const data: ISubmitMoveDto = {
        roundNumber: 1,
        move: 'rock',
      };

      await expect(
        gameplayService.submitMove('non-existent', player1.id, data)
      ).rejects.toThrow();
    });

    it('should throw error if player not participant', async () => {
      const data: ISubmitMoveDto = {
        roundNumber: 1,
        move: 'rock',
      };

      await expect(
        gameplayService.submitMove(match.id, 'non-participant', data)
      ).rejects.toThrow();
    });
  });

  describe('recordRound', () => {
    it('should record a round for live recording mode', async () => {
      const data: IRecordRoundDto = {
        roundNumber: 1,
        player1Move: 'rock',
        player2Move: 'paper',
        winnerId: player2.id,
      };

      const result = await gameplayService.recordRound(match.id, data);

      expect(result).toBeDefined();
      expect(result.roundNumber).toBe(1);
      expect(result.result).toBeDefined();
    });
  });

  describe('getMatchState', () => {
    it('should get current match state', async () => {
      const state = await gameplayService.getMatchState(match.id, player1.id);

      expect(state).toBeDefined();
      expect(state.currentRound).toBeDefined();
      expect(state.player1Score).toBeDefined();
      expect(state.player2Score).toBeDefined();
      expect(state.status).toBeDefined();
    });

    it('should throw error if player not participant', async () => {
      await expect(
        gameplayService.getMatchState(match.id, 'non-participant')
      ).rejects.toThrow();
    });
  });
});

