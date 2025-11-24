/**
 * TDD: Tests for TournamentRegistrationService
 * 
 * ISP: Separated registration operations
 */

import { PrismaClient } from '@prisma/client';
import { TournamentRegistrationService } from '../TournamentRegistrationService';
import { TournamentRepository } from '../../repositories/TournamentRepository';
import { TournamentEntryRepository } from '../../repositories/TournamentEntryRepository';
import { PlayerRepository } from '../../repositories/PlayerRepository';
import { GameTypeRepository } from '../../repositories/GameTypeRepository';
import { UserRepository } from '../../repositories/UserRepository';
import { IRegisterTournamentDto, TournamentEntryStatus } from '@rpsfull-platform/contracts';

describe('TournamentRegistrationService - Complete Coverage', () => {
  let prisma: PrismaClient;
  let tournamentRepository: TournamentRepository;
  let entryRepository: TournamentEntryRepository;
  let registrationService: TournamentRegistrationService;
  let tournament: any;
  let player: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    tournamentRepository = new TournamentRepository(prisma);
    entryRepository = new TournamentEntryRepository(prisma);
    registrationService = new TournamentRegistrationService(
      tournamentRepository,
      entryRepository
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.tournamentEntry.deleteMany({});
    await prisma.tournament.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.gameType.deleteMany({});
    await prisma.user.deleteMany({});

    const organizer = await new UserRepository(prisma).create({
      email: 'organizer@test.com',
      passwordHash: 'hash',
    });

    const gameType = await new GameTypeRepository(prisma).create({
      name: 'Test RPS',
      symbolCount: 3,
      symbols: [],
      winMatrix: {},
    });

    tournament = await tournamentRepository.create(
      {
        name: 'Test Tournament',
        gameTypeId: gameType.id,
        tournamentType: 'single_elimination',
        bestOfN: 3,
      },
      organizer.id
    );

    const user = await new UserRepository(prisma).create({
      email: 'player@test.com',
      passwordHash: 'hash',
    });

    player = await new PlayerRepository(prisma).create({
      userId: user.id,
      name: 'Test Player',
      email: 'player@test.com',
    });
  });

  describe('registerPlayer', () => {
    it('should register player for tournament', async () => {
      const data: IRegisterTournamentDto = { seed: 1 };

      await registrationService.registerPlayer(tournament.id, player.id, data);

      const entry = await entryRepository.findByTournamentAndPlayer(
        tournament.id,
        player.id
      );

      expect(entry).toBeDefined();
      expect(entry?.status).toBe(TournamentEntryStatus.REGISTERED);
    });

    it('should throw error if tournament not found', async () => {
      await expect(
        registrationService.registerPlayer('non-existent', player.id)
      ).rejects.toThrow();
    });

    it('should throw error if already registered', async () => {
      await entryRepository.create({
        tournamentId: tournament.id,
        playerId: player.id,
      });

      await expect(
        registrationService.registerPlayer(tournament.id, player.id)
      ).rejects.toThrow();
    });
  });

  describe('unregisterPlayer', () => {
    it('should unregister player from tournament', async () => {
      const entry = await entryRepository.create({
        tournamentId: tournament.id,
        playerId: player.id,
      });

      await registrationService.unregisterPlayer(tournament.id, player.id);

      const found = await entryRepository.findById(entry.id);
      expect(found).toBeNull();
    });
  });

  describe('isPlayerRegistered', () => {
    it('should return true if player is registered', async () => {
      await entryRepository.create({
        tournamentId: tournament.id,
        playerId: player.id,
      });

      const isRegistered = await registrationService.isPlayerRegistered(
        tournament.id,
        player.id
      );

      expect(isRegistered).toBe(true);
    });

    it('should return false if player is not registered', async () => {
      const isRegistered = await registrationService.isPlayerRegistered(
        tournament.id,
        'non-registered-player'
      );

      expect(isRegistered).toBe(false);
    });
  });
});

