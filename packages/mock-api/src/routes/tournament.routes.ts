/**
 * Tournament Routes
 * 
 * Tournament endpoints for Mock API
 */

import { Router, Response } from 'express';
import { MockDataService } from '../services/data.service';
import { mockAuthMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { TournamentStatus, TournamentType } from '@rpsfull-platform/contracts';

export function setupTournamentRoutes(db: MockDataService): Router {
  const router = Router();

  /**
   * POST /api/v1/tournaments
   * Create a new tournament
   */
  router.post('/', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const {
      name,
      description,
      gameTypeId,
      tournamentType,
      bestOfN,
      maxParticipants,
      rules,
      prizeInfo,
      startDate,
      registrationDeadline,
    } = req.body;

    if (!name || !gameTypeId || !tournamentType) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VAL_003',
          message: 'name, gameTypeId, and tournamentType are required',
        },
      });
    }

    const tournament = db.createTournament({
      name,
      description,
      gameTypeId,
      tournamentType: tournamentType as TournamentType,
      bestOfN: bestOfN || 3,
      maxParticipants,
      rules,
      prizeInfo,
      startDate: startDate ? new Date(startDate) : undefined,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
    });

    // Set organizer
    db.updateTournament(tournament.id, { organizerId: req.user!.id });

    res.status(201).json({
      success: true,
      data: tournament,
    });
  });

  /**
   * GET /api/v1/tournaments
   * Get tournaments list
   */
  router.get('/', (req, res: Response) => {
    const { status, limit = 20, page = 1 } = req.query;

    const tournaments = db.getTournaments({
      status: status as string | undefined,
    });

    const start = (Number(page) - 1) * Number(limit);
    const end = start + Number(limit);
    const paginated = tournaments.slice(start, end);

    res.json({
      success: true,
      data: paginated,
      meta: {
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: tournaments.length,
          totalPages: Math.ceil(tournaments.length / Number(limit)),
        },
      },
    });
  });

  /**
   * GET /api/v1/tournaments/:id
   * Get tournament by ID
   */
  router.get('/:id', (req, res: Response) => {
    const tournament = db.getTournamentById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TOUR_001',
          message: 'Tournament not found',
        },
      });
    }

    const gameType = db.getGameTypeById(tournament.gameTypeId);
    const entries = db.getTournamentEntriesByTournament(tournament.id);

    res.json({
      success: true,
      data: {
        ...tournament,
        gameType: gameType
          ? {
              id: gameType.id,
              name: gameType.name,
              description: gameType.description,
              symbolCount: gameType.symbolCount,
              symbols: gameType.symbols,
              winMatrix: gameType.winMatrix,
              isDefault: gameType.isDefault,
            }
          : null,
        entries,
      },
    });
  });

  /**
   * POST /api/v1/tournaments/:id/register
   * Register for tournament
   */
  router.post('/:id/register', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { seed } = req.body;
    const tournament = db.getTournamentById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TOUR_001',
          message: 'Tournament not found',
        },
      });
    }

    // Check if already registered
    const existing = db.getTournamentEntryByTournamentAndPlayer(
      tournament.id,
      req.user!.id
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOUR_004',
          message: 'Already registered for this tournament',
        },
      });
    }

    const entry = db.createTournamentEntry({
      tournamentId: tournament.id,
      playerId: req.user!.id,
      seed,
    });

    // Update participant count
    db.updateTournament(tournament.id, {
      participantCount: tournament.participantCount + 1,
    });

    res.status(201).json({
      success: true,
      data: {
        tournamentId: entry.tournamentId,
        playerId: entry.playerId,
        status: entry.status,
      },
    });
  });

  /**
   * PATCH /api/v1/tournaments/:id/start
   * Start tournament
   */
  router.patch('/:id/start', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const tournament = db.getTournamentById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TOUR_001',
          message: 'Tournament not found',
        },
      });
    }

    const updated = db.updateTournament(tournament.id, {
      status: TournamentStatus.IN_PROGRESS,
    });

    res.json({
      success: true,
      data: {
        id: updated!.id,
        status: updated!.status,
        bracketGenerated: true,
      },
    });
  });

  /**
   * GET /api/v1/tournaments/:id/bracket
   * Get tournament bracket
   */
  router.get('/:id/bracket', (req, res: Response) => {
    const tournament = db.getTournamentById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TOUR_001',
          message: 'Tournament not found',
        },
      });
    }

    res.json({
      success: true,
      data: {
        tournamentId: tournament.id,
        currentRound: tournament.currentRound,
        rounds: [],
      },
    });
  });

  return router;
}

