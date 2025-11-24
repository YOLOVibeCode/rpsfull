/**
 * Match Invitation Service Interface
 * 
 * ISP: Small, focused interface for match invitation operations only
 */

import { IMatch } from '../../entities/Match.entity';
import {
  ICreateMatchWithInvitationDto,
  IJoinMatchByTokenDto,
  IMatchInvitationResponseDto,
} from '../../dtos/match.dto';

/**
 * Match invitation service interface
 * Focused only on invitation-related operations
 */
export interface IMatchInvitationService {
  /**
   * Create a match with invitation token
   */
  createMatchWithInvitation(
    data: ICreateMatchWithInvitationDto
  ): Promise<IMatchInvitationResponseDto>;

  /**
   * Join a match using invitation token
   */
  joinMatchByToken(data: IJoinMatchByTokenDto): Promise<IMatch>;

  /**
   * Get invitation details by token
   */
  getInvitationDetails(token: string): Promise<IMatchInvitationResponseDto>;

  /**
   * Regenerate invitation token for a match
   */
  regenerateInvitationToken(matchId: string): Promise<string>;

  /**
   * Revoke invitation token for a match
   */
  revokeInvitation(matchId: string): Promise<void>;
}

