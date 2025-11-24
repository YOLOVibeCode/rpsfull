/**
 * Match Routes
 * 
 * Match endpoints for Mock API
 */

import { Router, Response } from 'express';
import { MockDataService } from '../services/data.service';
import { mockAuthMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { PlayMode, MatchStatus, RoundResult } from '@rpsfull-platform/contracts';

export function setupMatchRoutes(db: MockDataService): Router {
  const router = Router();

  /**
   * POST /api/v1/matches
   * Create a new match
   */
  router.post('/', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { player2Id, gameTypeId, bestOfN, playMode, tournamentId, tiesCount } = req.body;

    if (!player2Id || !gameTypeId) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VAL_003',
          message: 'player2Id and gameTypeId are required',
        },
      });
    }

    const match = db.createMatch({
      player1Id: req.user!.id,
      player2Id,
      gameTypeId,
      bestOfN: bestOfN || 3,
      playMode: playMode || PlayMode.DIGITAL,
      tournamentId,
      tiesCount,
    });

    res.status(201).json({
      success: true,
      data: match,
    });
  });

  /**
   * GET /api/v1/matches/:id
   * Get match by ID
   */
  router.get('/:id', (req, res: Response) => {
    const match = db.getMatchById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_001',
          message: 'Match not found',
        },
      });
    }

    const player1 = db.getPlayerById(match.player1Id);
    const player2 = db.getPlayerById(match.player2Id);
    const rounds = db.getRoundsByMatchId(match.id);
    const gameType = db.getGameTypeById(match.gameTypeId);

    res.json({
      success: true,
      data: {
        ...match,
        player1: player1
          ? {
              id: player1.id,
              name: player1.name,
              displayName: player1.displayName,
              level: player1.level,
              ranking: player1.ranking,
            }
          : null,
        player2: player2
          ? {
              id: player2.id,
              name: player2.name,
              displayName: player2.displayName,
              level: player2.level,
              ranking: player2.ranking,
            }
          : null,
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
        rounds,
      },
    });
  });

  /**
   * GET /api/v1/matches/my
   * Get current user's matches
   */
  router.get('/my', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { status, limit = 20, page = 1 } = req.query;

    const matches = db.getMatchesByPlayer(req.user!.id, {
      status: status as string | undefined,
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
  });

  /**
   * PATCH /api/v1/matches/:id/start
   * Start a match
   */
  router.patch('/:id/start', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const match = db.getMatchById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_001',
          message: 'Match not found',
        },
      });
    }

    if (match.status !== MatchStatus.PENDING) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MATCH_002',
          message: 'Match already started or completed',
        },
      });
    }

    const updated = db.updateMatch(req.params.id, {
      status: MatchStatus.IN_PROGRESS,
      startedAt: new Date(),
    });

    res.json({
      success: true,
      data: {
        id: updated!.id,
        status: updated!.status,
        startedAt: updated!.startedAt,
      },
    });
  });

  /**
   * POST /api/v1/matches/:id/rounds
   * Submit a move in a match
   */
  router.post('/:id/rounds', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { roundNumber, move, timeTakenMs } = req.body;
    const match = db.getMatchById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_001',
          message: 'Match not found',
        },
      });
    }

    // Mock: Simulate opponent move after delay
    const moves = ['rock', 'paper', 'scissors'];
    const opponentMove = moves[Math.floor(Math.random() * moves.length)];

    // Simple RPS logic
    let result: RoundResult;
    if (move === opponentMove) {
      result = RoundResult.TIE;
    } else if (
      (move === 'rock' && opponentMove === 'scissors') ||
      (move === 'paper' && opponentMove === 'rock') ||
      (move === 'scissors' && opponentMove === 'paper')
    ) {
      result = RoundResult.PLAYER1_WIN;
    } else {
      result = RoundResult.PLAYER2_WIN;
    }

    // Create round
    const round = db.createRound({
      matchId: match.id,
      roundNumber,
      player1Move: move,
      player2Move: opponentMove,
      result,
      winnerId:
        result === RoundResult.PLAYER1_WIN
          ? match.player1Id
          : result === RoundResult.PLAYER2_WIN
          ? match.player2Id
          : undefined,
      player1TimeMs: timeTakenMs,
    });

    // Update match scores
    let player1Score = match.player1Score;
    let player2Score = match.player2Score;

    if (result === RoundResult.PLAYER1_WIN) {
      player1Score++;
    } else if (result === RoundResult.PLAYER2_WIN) {
      player2Score++;
    }

    const totalRounds = match.totalRounds + 1;
    const matchComplete =
      player1Score > match.bestOfN / 2 || player2Score > match.bestOfN / 2;

    db.updateMatch(match.id, {
      player1Score,
      player2Score,
      totalRounds,
      status: matchComplete ? MatchStatus.COMPLETED : MatchStatus.IN_PROGRESS,
      completedAt: matchComplete ? new Date() : undefined,
      winnerId: matchComplete
        ? player1Score > player2Score
          ? match.player1Id
          : match.player2Id
        : undefined,
    });

    res.status(201).json({
      success: true,
      data: {
        roundNumber,
        yourMove: move,
        opponentMove,
        result,
        waiting: false,
        matchComplete,
        currentScore: {
          player1: player1Score,
          player2: player2Score,
        },
      },
    });
  });

  /**
   * POST /api/v1/matches/:id/record-round
   * Record a round (for live recording mode)
   */
  router.post('/:id/record-round', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { roundNumber, player1Move, player2Move, winnerId } = req.body;
    const match = db.getMatchById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_001',
          message: 'Match not found',
        },
      });
    }

    // Determine result
    let result: RoundResult;
    if (winnerId === match.player1Id) {
      result = RoundResult.PLAYER1_WIN;
    } else if (winnerId === match.player2Id) {
      result = RoundResult.PLAYER2_WIN;
    } else {
      result = RoundResult.TIE;
    }

    // Create round
    db.createRound({
      matchId: match.id,
      roundNumber,
      player1Move,
      player2Move,
      result,
      winnerId,
    });

    // Update scores
    let player1Score = match.player1Score;
    let player2Score = match.player2Score;

    if (result === RoundResult.PLAYER1_WIN) {
      player1Score++;
    } else if (result === RoundResult.PLAYER2_WIN) {
      player2Score++;
    }

    const matchComplete =
      player1Score > match.bestOfN / 2 || player2Score > match.bestOfN / 2;

    db.updateMatch(match.id, {
      player1Score,
      player2Score,
      totalRounds: match.totalRounds + 1,
      status: matchComplete ? MatchStatus.COMPLETED : MatchStatus.IN_PROGRESS,
      completedAt: matchComplete ? new Date() : undefined,
      winnerId: matchComplete
        ? player1Score > player2Score
          ? match.player1Id
          : match.player2Id
        : undefined,
    });

    res.status(201).json({
      success: true,
      data: {
        roundNumber,
        result,
        currentScore: {
          player1: player1Score,
          player2: player2Score,
        },
        matchComplete,
      },
    });
  });

  /**
   * DELETE /api/v1/matches/:id
   * Cancel a match
   */
  router.delete('/:id', mockAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const match = db.getMatchById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MATCH_001',
          message: 'Match not found',
        },
      });
    }

    db.updateMatch(req.params.id, {
      status: MatchStatus.CANCELLED,
    });

    res.json({
      success: true,
      message: 'Match cancelled successfully',
    });
  });

  return router;
}

