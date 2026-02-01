import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface LeagueInviteEmailParams {
  to: string;
  leagueName: string;
  leagueDescription?: string;
  inviterName: string;
  joinUrl: string;
  expiresAt: Date;
}

@Injectable()
export class EmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.fromEmail = this.config.get('FROM_EMAIL') || 'noreply@survivor.com';
  }

  async sendLeagueInvite(params: LeagueInviteEmailParams): Promise<void> {
    const { to, leagueName, leagueDescription, inviterName, joinUrl, expiresAt } = params;

    const expiryDays = Math.ceil(
      (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    await this.resend.emails.send({
      from: `Survivor Fantasy League <${this.fromEmail}>`,
      to: [to],
      subject: `You've been invited to join ${leagueName}!`,
      html: this.getInviteEmailHtml({
        leagueName,
        leagueDescription,
        inviterName,
        joinUrl,
        expiryDays,
      }),
    });
  }

  private getInviteEmailHtml(params: {
    leagueName: string;
    leagueDescription?: string;
    inviterName: string;
    joinUrl: string;
    expiryDays: number;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F06542; padding: 30px; text-align: center; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .cta-button {
              display: inline-block;
              background: #F06542;
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏝️ Survivor Fantasy League</h1>
            </div>
            <div class="content">
              <h2>You've been invited!</h2>
              <p><strong>${params.inviterName}</strong> has invited you to join <strong>${params.leagueName}</strong>.</p>
              ${params.leagueDescription ? `<p>${params.leagueDescription}</p>` : ''}
              <p>Join your league to:</p>
              <ul>
                <li>Draft your favorite castaways</li>
                <li>Compete with friends for points</li>
                <li>Answer weekly team questions</li>
                <li>Track standings and scores</li>
              </ul>
              <center>
                <a href="${params.joinUrl}" class="cta-button">Join League Now</a>
              </center>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                This invite expires in ${params.expiryDays} days. Don't wait!
              </p>
            </div>
            <div class="footer">
              <p>Survivor Fantasy League © 2026</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
