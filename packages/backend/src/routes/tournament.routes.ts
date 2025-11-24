/**
 * Tournament Routes
 * 
 * Tournament endpoints
 */

import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  createTournamentSchema,
  registerTournamentSchema,
} from '@rpsfull-platform/contracts';
import {
  tournamentService,
  tournamentRegistrationService,
  tournamentBracketService,
  playerRepository,
} from '../config/services';

export function setupTournamentRoutes(): Router {
  const router = Router();

  /**
   * POST /api/v1/tournaments
   * Create a new tournament
   */
  router.post(
    '/',
    authMiddleware,
    validateBody(createTournamentSchema),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const tournament = await tournamentService.createTournament(
          req.body,
          req.user!.id
        );
        res.status(201).json({
          success: true,
          data: tournament,
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'TOUR_001',
            message: error.message,
          },
        });
      }
    }
  );

  /**
   * GET /api/v1/tournaments
   * Get tournaments list
   */
  router.get('/', async (req, res: Response) => {
    try {
      const { status, limit = 20, page = 1 } = req.query;
      const tournaments = await tournamentService.getTournaments({
        status: status as any,
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * GET /api/v1/tournaments/:id
   * Get tournament by ID
   */
  router.get('/:id', async (req, res: Response) => {
    try {
      const tournament = await tournamentService.getTournamentById(req.params.id);
      res.json({
        success: true,
        data: tournament,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'TOUR_001',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/tournaments/:id/register
   * Register for tournament
   */
  router.post(
    '/:id/register',
    authMiddleware,
    validateBody(registerTournamentSchema),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        // Get player ID from user
        const player = await playerRepository.findByUserId(req.user!.id);
        if (!player) {
          return res.status(404).json({
            success: false,
            error: {
              code: 'RES_001',
              message: 'Player profile not found',
            },
          });
        }

        await tournamentRegistrationService.registerPlayer(
          req.params.id,
          player.id,
          req.body
        );
        res.status(201).json({
          success: true,
          message: 'Registered for tournament successfully',
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'TOUR_004',
            message: error.message,
          },
        });
      }
    }
  );

  /**
   * PATCH /api/v1/tournaments/:id/start
   * Start tournament
   */
  router.patch('/:id/start', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tournament = await tournamentBracketService.startTournament(
        req.params.id,
        req.user!.id
      );
      res.json({
        success: true,
        data: {
          id: tournament.id,
          status: tournament.status,
          bracketGenerated: true,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TOUR_006',
          message: error.message,
        },
      });
    }
  });

  /**
   * GET /api/v1/tournaments/:id/bracket
   * Get tournament bracket
   */
  router.get('/:id/bracket', async (req, res: Response) => {
    try {
      const bracket = await tournamentBracketService.getBracket(req.params.id);
      res.json({
        success: true,
        data: bracket,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'TOUR_001',
          message: error.message,
        },
      });
    }
  });

  return router;
}

