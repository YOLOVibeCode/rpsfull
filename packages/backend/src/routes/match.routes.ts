/**
 * Match Routes
 * 
 * Match endpoints
 */

import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  createMatchSchema,
  submitMoveSchema,
  recordRoundSchema,
  createMatchWithInvitationSchema,
  joinMatchByTokenSchema,
} from '@rpsfull-platform/contracts';
import {
  matchService,
  matchGameplayService,
  quickStartService,
  matchInvitationService,
} from '../config/services';

export function setupMatchRoutes(): Router {
  const router = Router();

  /**
   * POST /api/v1/matches
   * Create a new match
   */
  router.post(
    '/',
    authMiddleware,
    validateBody(createMatchSchema),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const match = await matchService.createMatch(req.body, req.user!.id);
        res.status(201).json({
          success: true,
          data: match,
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MATCH_001',
            message: error.message,
          },
        });
      }
    }
  );

  /**
   * GET /api/v1/matches/:id
   * Get match by ID
   */
  router.get('/:id', async (req, res: Response) => {
    try {
      const match = await matchService.getMatchById(req.params.id);
      res.json({
        success: true,
        data: match,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_001',
          message: error.message,
        },
      });
    }
  });

  /**
   * GET /api/v1/matches/my
   * Get current user's matches
   */
  router.get('/my', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, limit = 20, page = 1 } = req.query;
      const matches = await matchService.getPlayerMatches(req.user!.id, {
        status: status as any,
      });

      const start = (Number(page) - 1) * Number(limit);
      const end = start + Number(limit);
      const paginated = matches.slice(start, end);

      res.json({
        success: true,
        data: paginated,
        meta: {
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: matches.length,
            totalPages: Math.ceil(matches.length / Number(limit)),
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
   * PATCH /api/v1/matches/:id/start
   * Start a match
   */
  router.patch('/:id/start', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const match = await matchService.startMatch(req.params.id, req.user!.id);
      res.json({
        success: true,
        data: {
          id: match.id,
          status: match.status,
          startedAt: match.startedAt,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MATCH_002',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/matches/:id/rounds
   * Submit a move in a match
   */
  router.post(
    '/:id/rounds',
    authMiddleware,
    validateBody(submitMoveSchema),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const result = await matchGameplayService.submitMove(
          req.params.id,
          req.user!.id,
          req.body
        );
        res.status(201).json({
          success: true,
          data: result,
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MATCH_005',
            message: error.message,
          },
        });
      }
    }
  );

  /**
   * POST /api/v1/matches/:id/record-round
   * Record a round (for live recording mode)
   */
  router.post(
    '/:id/record-round',
    authMiddleware,
    validateBody(recordRoundSchema),
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const result = await matchGameplayService.recordRound(req.params.id, req.body);
        res.status(201).json({
          success: true,
          data: result,
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MATCH_005',
            message: error.message,
          },
        });
      }
    }
  );

  /**
   * DELETE /api/v1/matches/:id
   * Cancel a match
   */
  router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await matchService.cancelMatch(req.params.id, req.user!.id);
      res.json({
        success: true,
        message: 'Match cancelled successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MATCH_001',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/matches/quick-start
   * Quick start a game with two players (no auth required)
   */
  router.post('/quick-start', async (req, res: Response) => {
    try {
      const { player1, player2 } = req.body;

      // Basic validation
      if (!player1 || !player2) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUICK_START_001',
            message: 'Both player1 and player2 are required',
          },
        });
      }

      if (!player1.firstName || !player1.lastName || !player1.email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUICK_START_002',
            message: 'Player 1 requires firstName, lastName, and email',
          },
        });
      }

      if (!player2.firstName || !player2.lastName || !player2.email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUICK_START_003',
            message: 'Player 2 requires firstName, lastName, and email',
          },
        });
      }

      const result = await quickStartService.quickStartGame({
        player1: {
          firstName: player1.firstName.trim(),
          lastName: player1.lastName.trim(),
          email: player1.email.trim(),
        },
        player2: {
          firstName: player2.firstName.trim(),
          lastName: player2.lastName.trim(),
          email: player2.email.trim(),
        },
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'QUICK_START_004',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/matches/create-with-invitation
   * Create a match with invitation token (no auth required)
   */
  router.post(
    '/create-with-invitation',
    validateBody(createMatchWithInvitationSchema),
    async (req, res: Response) => {
      try {
        const result = await matchInvitationService.createMatchWithInvitation(req.body);
        res.status(201).json({
          success: true,
          data: result,
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MATCH_INVITE_001',
            message: error.message,
          },
        });
      }
    }
  );

  /**
   * GET /api/v1/matches/join/:token
   * Get match details for join page (public, no auth required)
   */
  router.get('/join/:token', async (req, res: Response) => {
    try {
      const { token } = req.params;
      const invitationDetails = await matchInvitationService.getInvitationDetails(token);
      res.json({
        success: true,
        data: invitationDetails,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_INVITE_002',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/matches/join/:token
   * Join a match using invitation token (public, no auth required)
   */
  router.post(
    '/join/:token',
    validateBody(joinMatchByTokenSchema),
    async (req, res: Response) => {
      try {
        const { token } = req.params;
        const match = await matchInvitationService.joinMatchByToken({
          token,
          player2: req.body.player2,
        });
        res.json({
          success: true,
          data: {
            matchId: match.id,
            message: 'Successfully joined the match',
          },
        });
      } catch (error: any) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MATCH_INVITE_003',
            message: error.message,
          },
        });
      }
    }
  );

  /**
   * GET /api/v1/matches/:id/invitation
   * Get invitation details for a match (protected, Player 1 only)
   */
  router.get('/:id/invitation', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const match = await matchService.getMatchById(req.params.id);
      
      if (!match.invitationToken) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MATCH_INVITE_004',
            message: 'No invitation found for this match',
          },
        });
      }

      const invitationDetails = await matchInvitationService.getInvitationDetails(match.invitationToken);
      res.json({
        success: true,
        data: invitationDetails,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_INVITE_005',
          message: error.message,
        },
      });
    }
  });

  /**
   * POST /api/v1/matches/:id/invitation/regenerate
   * Regenerate invitation token (protected, Player 1 only)
   */
  router.post('/:id/invitation/regenerate', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const newToken = await matchInvitationService.regenerateInvitationToken(req.params.id);
      const invitationDetails = await matchInvitationService.getInvitationDetails(newToken);
      res.json({
        success: true,
        data: invitationDetails,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MATCH_INVITE_006',
          message: error.message,
        },
      });
    }
  });

  /**
   * DELETE /api/v1/matches/:id/invitation
   * Revoke invitation token (protected, Player 1 only)
   */
  router.delete('/:id/invitation', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await matchInvitationService.revokeInvitation(req.params.id);
      res.json({
        success: true,
        message: 'Invitation revoked successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MATCH_INVITE_007',
          message: error.message,
        },
      });
    }
  });

  return router;
}

