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
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: { code: 'AUTH_001', message: 'Not authenticated' },
          });
        }
        const match = await matchService.createMatch(req.body, req.user['id']);
        return res.status(201).json({
          success: true,
          data: match,
        });
      } catch (error: any) {
        return res.status(400).json({
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
      const matchId = req.params['id'];
      if (!matchId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Match ID is required' },
        });
      }
      const match = await matchService.getMatchById(matchId);
      return res.json({
        success: true,
        data: match,
      });
    } catch (error: any) {
      return res.status(404).json({
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
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'AUTH_001', message: 'Not authenticated' },
        });
      }
      const { status, limit = 20, page = 1 } = req.query;
      const matches = await matchService.getPlayerMatches(req.user['id'], {
        status: status as any,
      });

      const start = (Number(page) - 1) * Number(limit);
      const end = start + Number(limit);
      const paginated = matches.slice(start, end);

      return res.json({
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
   * PATCH /api/v1/matches/:id/start
   * Start a match
   */
  router.patch('/:id/start', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const matchId = req.params['id'];
      if (!matchId || !req.user) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Match ID and authentication required' },
        });
      }
      const match = await matchService.startMatch(matchId, req.user['id']);
      return res.json({
        success: true,
        data: {
          id: match.id,
          status: match.status,
          startedAt: match.startedAt,
        },
      });
    } catch (error: any) {
      return res.status(400).json({
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
        const matchId = req.params['id'];
        if (!matchId || !req.user) {
          return res.status(400).json({
            success: false,
            error: { code: 'VAL_001', message: 'Match ID and authentication required' },
          });
        }
        const result = await matchGameplayService.submitMove(
          matchId,
          req.user['id'],
          req.body
        );
        return res.status(201).json({
          success: true,
          data: result,
        });
      } catch (error: any) {
        return res.status(400).json({
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
        const matchId = req.params['id'];
        if (!matchId) {
          return res.status(400).json({
            success: false,
            error: { code: 'VAL_001', message: 'Match ID is required' },
          });
        }
        const result = await matchGameplayService.recordRound(matchId, req.body);
        return res.status(201).json({
          success: true,
          data: result,
        });
      } catch (error: any) {
        return res.status(400).json({
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
      const matchId = req.params['id'];
      if (!matchId || !req.user) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Match ID and authentication required' },
        });
      }
      await matchService.cancelMatch(matchId, req.user['id']);
      return res.json({
        success: true,
        message: 'Match cancelled successfully',
      });
    } catch (error: any) {
      return res.status(400).json({
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

      // Validate and sanitize player1
      if (!player1.firstName || typeof player1.firstName !== 'string' || !player1.firstName.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUICK_START_002',
            message: 'Player 1 firstName is required',
          },
        });
      }
      if (!player1.lastName || typeof player1.lastName !== 'string' || !player1.lastName.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUICK_START_002',
            message: 'Player 1 lastName is required',
          },
        });
      }
      if (!player1.email || typeof player1.email !== 'string' || !player1.email.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUICK_START_002',
            message: 'Player 1 email is required',
          },
        });
      }

      // Validate and sanitize player2
      if (!player2.firstName || typeof player2.firstName !== 'string' || !player2.firstName.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUICK_START_003',
            message: 'Player 2 firstName is required',
          },
        });
      }
      if (!player2.lastName || typeof player2.lastName !== 'string' || !player2.lastName.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUICK_START_003',
            message: 'Player 2 lastName is required',
          },
        });
      }
      if (!player2.email || typeof player2.email !== 'string' || !player2.email.trim()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUICK_START_003',
            message: 'Player 2 email is required',
          },
        });
      }

      // Sanitize all fields
      const player1Data = {
        firstName: String(player1.firstName).trim(),
        lastName: String(player1.lastName).trim(),
        email: String(player1.email).trim().toLowerCase(),
      };
      
      const player2Data = {
        firstName: String(player2.firstName).trim(),
        lastName: String(player2.lastName).trim(),
        email: String(player2.email).trim().toLowerCase(),
      };

      // Final validation after sanitization
      if (!player1Data.email || !player2Data.email) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'QUICK_START_002',
            message: 'Both players must have valid email addresses',
          },
        });
      }

      // Log the data being sent to service for debugging
      console.log('QuickStart - Calling service with:', JSON.stringify({ player1: player1Data, player2: player2Data }, null, 2));
      
      const result = await quickStartService.quickStartGame({
        player1: player1Data,
        player2: player2Data,
      });

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('QuickStart error:', error.message, error.stack);
      return res.status(400).json({
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
        return res.status(201).json({
          success: true,
          data: result,
        });
      } catch (error: any) {
        return res.status(400).json({
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
      return res.status(404).json({
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
        return res.json({
          success: true,
          data: {
            matchId: match.id,
            message: 'Successfully joined the match',
          },
        });
      } catch (error: any) {
        return res.status(400).json({
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
      const matchId = req.params['id'];
      if (!matchId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Match ID is required' },
        });
      }
      const match = await matchService.getMatchById(matchId);
      
      if (!match || !match.invitationToken) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MATCH_INVITE_004',
            message: 'No invitation found for this match',
          },
        });
      }

      const invitationDetails = await matchInvitationService.getInvitationDetails(match.invitationToken);
      return res.json({
        success: true,
        data: invitationDetails,
      });
    } catch (error: any) {
      return res.status(404).json({
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
      const matchId = req.params['id'];
      if (!matchId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Match ID is required' },
        });
      }
      const newToken = await matchInvitationService.regenerateInvitationToken(matchId);
      const invitationDetails = await matchInvitationService.getInvitationDetails(newToken);
      return res.json({
        success: true,
        data: invitationDetails,
      });
    } catch (error: any) {
      return res.status(400).json({
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
      const matchId = req.params['id'];
      if (!matchId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VAL_001', message: 'Match ID is required' },
        });
      }
      await matchInvitationService.revokeInvitation(matchId);
      return res.json({
        success: true,
        message: 'Invitation revoked successfully',
      });
    } catch (error: any) {
      return res.status(400).json({
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

