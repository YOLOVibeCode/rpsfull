/**
 * Email Service
 * 
 * Handles sending emails for tournament registrations and invitations
 * Uses SendGrid API for production, falls back to SMTP or console logging
 * Following ISP: Small, focused interface for email operations only
 */

import { IEmailService } from '@rpsfull-platform/contracts';
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

export class EmailService implements IEmailService {
  private useSendGrid: boolean = false;
  private smtpTransporter: nodemailer.Transporter | null = null;

  constructor() {
    // Check for SendGrid API key (preferred for production)
    if (process.env['SENDGRID_API_KEY']) {
      sgMail.setApiKey(process.env['SENDGRID_API_KEY']);
      this.useSendGrid = true;
      console.log('EmailService: Using SendGrid for email delivery');
    }
    // Fallback to SMTP if SendGrid not available
    else if (
      process.env['SMTP_HOST'] &&
      process.env['SMTP_PORT'] &&
      process.env['SMTP_USER'] &&
      process.env['SMTP_PASS']
    ) {
      this.smtpTransporter = nodemailer.createTransport({
        host: process.env['SMTP_HOST'],
        port: parseInt(process.env['SMTP_PORT'] || '587'),
        secure: process.env['SMTP_PORT'] === '465',
        auth: {
          user: process.env['SMTP_USER'],
          pass: process.env['SMTP_PASS'],
        },
      });
      console.log('EmailService: Using SMTP for email delivery');
    } else {
      // In development/test, log emails instead of sending
      console.warn('EmailService: No email service configured. Emails will be logged only.');
    }
  }

  async sendTournamentRegistrationEmail(data: {
    to: string;
    tournamentName: string;
    confirmLink: string;
    expiresAt: Date;
  }): Promise<void> {
    const emailHtml = this.getTournamentRegistrationEmailTemplate(data);
    const fromEmail = process.env['EMAIL_FROM'] || 'noreply@rpsfull.pro';
    const subject = `Confirm Registration: ${data.tournamentName}`;

    if (this.useSendGrid) {
      try {
        await sgMail.send({
          from: fromEmail,
          to: data.to,
          subject,
          html: emailHtml,
        });
        console.log(`✅ Email sent via SendGrid to ${data.to}`);
      } catch (error: any) {
        console.error('SendGrid error:', error.response?.body || error.message);
        throw new Error(`Failed to send email: ${error.message}`);
      }
    } else if (this.smtpTransporter) {
      await this.smtpTransporter.sendMail({
        from: fromEmail,
        to: data.to,
        subject,
        html: emailHtml,
      });
    } else {
      // Development mode - log email
      console.log('📧 Email (not sent - no email service configured):');
      console.log(`To: ${data.to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Link: ${data.confirmLink}`);
    }
  }

  async sendTournamentInvitationEmail(data: {
    to: string;
    tournamentName: string;
    inviterName: string;
    joinLink: string;
  }): Promise<void> {
    const emailHtml = this.getTournamentInvitationEmailTemplate(data);
    const fromEmail = process.env['EMAIL_FROM'] || 'noreply@rpsfull.pro';
    const subject = `You're Invited: ${data.tournamentName}`;

    if (this.useSendGrid) {
      try {
        await sgMail.send({
          from: fromEmail,
          to: data.to,
          subject,
          html: emailHtml,
        });
        console.log(`✅ Email sent via SendGrid to ${data.to}`);
      } catch (error: any) {
        console.error('SendGrid error:', error.response?.body || error.message);
        throw new Error(`Failed to send email: ${error.message}`);
      }
    } else if (this.smtpTransporter) {
      await this.smtpTransporter.sendMail({
        from: fromEmail,
        to: data.to,
        subject,
        html: emailHtml,
      });
    } else {
      // Development mode - log email
      console.log('📧 Email (not sent - no email service configured):');
      console.log(`To: ${data.to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Link: ${data.joinLink}`);
    }
  }

  private getTournamentRegistrationEmailTemplate(data: {
    tournamentName: string;
    confirmLink: string;
    expiresAt: Date;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Tournament Registration</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Join Tournament</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1f2937; margin-top: 0;">You've been invited to join: ${data.tournamentName}</h2>
    
    <p style="color: #4b5563;">Click the button below to confirm your registration:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.confirmLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Confirm Registration
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Or copy and paste this link into your browser:<br>
      <a href="${data.confirmLink}" style="color: #667eea; word-break: break-all;">${data.confirmLink}</a>
    </p>
    
    <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
      This link expires on ${data.expiresAt.toLocaleString()}.
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  private getTournamentInvitationEmailTemplate(data: {
    tournamentName: string;
    inviterName: string;
    joinLink: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tournament Invitation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Tournament Invitation</h1>
  </div>
  
  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="color: #4b5563;">${data.inviterName} has invited you to join:</p>
    <h2 style="color: #1f2937; margin-top: 0;">${data.tournamentName}</h2>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.joinLink}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Join Tournament
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Or copy and paste this link into your browser:<br>
      <a href="${data.joinLink}" style="color: #667eea; word-break: break-all;">${data.joinLink}</a>
    </p>
  </div>
</body>
</html>
    `.trim();
  }
}

