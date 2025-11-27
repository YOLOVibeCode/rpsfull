/**
 * Email Service Interface
 * 
 * ISP: Small, focused interface for email operations only
 */

export interface IEmailService {
  /**
   * Send tournament registration confirmation email
   */
  sendTournamentRegistrationEmail(data: {
    to: string;
    tournamentName: string;
    confirmLink: string;
    expiresAt: Date;
  }): Promise<void>;

  /**
   * Send tournament invitation email
   */
  sendTournamentInvitationEmail(data: {
    to: string;
    tournamentName: string;
    inviterName: string;
    joinLink: string;
  }): Promise<void>;
}

