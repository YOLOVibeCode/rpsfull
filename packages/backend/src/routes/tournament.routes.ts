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
  tournamentInvitationService,
  tournamentMagicLinkService,
  qrCodeService,
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
        return res.status(400).json({
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
   * GET /api/v1/tournaments/:id/public
   * Get public tournament information (no authentication required)
   */
  router.get('/:id/public', async (req, res: Response) => {
    try {
      const tournament = await tournamentService.getPublicTournamentById(req.params.id);
      return res.json({
        success: true,
        data: tournament,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TOUR_001',
          message: error.message || 'Tournament not found',
        },
      });
    }
  });

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
      return res.status(500).json({
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
      return res.status(404).json({
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
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: { code: 'AUTH_001', message: 'Not authenticated' },
          });
        }
        const tournamentId = req.params['id'];
        if (!tournamentId) {
          return res.status(400).json({
            success: false,
            error: { code: 'VAL_001', message: 'Tournament ID is required' },
          });
        }
        const player = await playerRepository.findByUserId(req.user['id']);
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
          tournamentId,
          player.id,
          req.body
        );
        return res.status(201).json({
          success: true,
          message: 'Registered for tournament successfully',
        });
      } catch (error: any) {
        return res.status(400).json({
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
      const tournamentId = req.params['id'];
      if (!tournamentId || !req.user) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Tournament ID and authentication required' },
        });
      }
      const tournament = await tournamentBracketService.startTournament(
        tournamentId,
        req.user['id']
      );
      return res.json({
        success: true,
        data: {
          id: tournament.id,
          status: tournament.status,
          bracketGenerated: true,
        },
      });
    } catch (error: any) {
      return res.status(400).json({
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

  /**
   * POST /api/v1/tournaments/:id/invitation
   * Create invitation for tournament (organizer only)
   */
  router.post('/:id/invitation', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tournamentId = req.params['id'];
      if (!tournamentId || !req.user) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Tournament ID and authentication required' },
        });
      }
      const invitation = await tournamentInvitationService.createInvitation(
        tournamentId,
        req.user['id']
      );
      return res.json({
        success: true,
        data: invitation,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOUR_007',
          message: error.message,
        },
      });
    }
  });

  /**
   * GET /api/v1/tournaments/join/:token
   * Get invitation details by token (public)
   */
  router.get('/join/:token', async (req, res: Response) => {
    try {
      const details = await tournamentInvitationService.getInvitationDetails(req.params.token);
      return res.json({
        success: true,
        data: details,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TOUR_008',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/tournaments/join/:token
   * Join tournament via token (public, creates user if needed)
   */
  router.post('/join/:token', async (req, res: Response) => {
    try {
      const { player } = req.body;
      if (!player || !player.firstName || !player.lastName || !player.email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VAL_001',
            message: 'Player information (firstName, lastName, email) is required',
          },
        });
      }
      const result = await tournamentInvitationService.joinByToken(req.params.token, player);
      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOUR_009',
          message: error.message,
        },
      });
    }
  });

  /**
   * DELETE /api/v1/tournaments/:id/invitation
   * Revoke invitation (organizer only)
   */
  router.delete('/:id/invitation', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tournamentId = req.params['id'];
      if (!tournamentId || !req.user) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Tournament ID and authentication required' },
        });
      }
      await tournamentInvitationService.revokeInvitation(tournamentId, req.user['id']);
      return res.json({
        success: true,
        message: 'Invitation revoked',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOUR_010',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/tournaments/:id/invitation/regenerate
   * Regenerate invitation token (organizer only)
   */
  router.post('/:id/invitation/regenerate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tournamentId = req.params['id'];
      if (!tournamentId || !req.user) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Tournament ID and authentication required' },
        });
      }
      const newToken = await tournamentInvitationService.regenerateToken(tournamentId, req.user['id']);
      return res.json({
        success: true,
        data: { token: newToken },
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOUR_011',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/tournaments/:id/register-email
   * Request magic link registration (public)
   */
  router.post('/:id/register-email', async (req, res: Response) => {
    try {
      const tournamentId = req.params['id'];
      const { email, firstName, lastName } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VAL_001',
            message: 'Email is required',
          },
        });
      }

      await tournamentMagicLinkService.requestRegistration(
        tournamentId,
        email,
        firstName,
        lastName
      );

      return res.json({
        success: true,
        message: 'Check your email for a confirmation link',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOUR_014',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/tournaments/confirm-registration/:token
   * Confirm magic link registration (public)
   */
  router.post('/confirm-registration/:token', async (req, res: Response) => {
    try {
      const result = await tournamentMagicLinkService.confirmRegistration(req.params.token);
      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOUR_015',
          message: error.message,
        },
      });
    }
  });

  return router;
}

