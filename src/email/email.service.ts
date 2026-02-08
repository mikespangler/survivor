import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get('RESEND_API_KEY');
    this.fromEmail = this.config.get('FROM_EMAIL') || 'noreply@outpickoutlast.com';

    this.logger.log(`EmailService initialized`);
    this.logger.log(`FROM_EMAIL: ${this.fromEmail}`);
    this.logger.log(`RESEND_API_KEY present: ${!!apiKey}`);
    this.logger.log(`RESEND_API_KEY length: ${apiKey?.length || 0}`);
    this.logger.log(`RESEND_API_KEY prefix: ${apiKey?.substring(0, 8) || 'N/A'}...`);

    this.resend = new Resend(apiKey);
  }

  async sendLeagueInvite(params: LeagueInviteEmailParams): Promise<void> {
    const { to, leagueName, leagueDescription, inviterName, joinUrl, expiresAt } = params;

    this.logger.log(`=== SENDING LEAGUE INVITE EMAIL ===`);
    this.logger.log(`To: ${to}`);
    this.logger.log(`League: ${leagueName}`);
    this.logger.log(`Inviter: ${inviterName}`);
    this.logger.log(`Join URL: ${joinUrl}`);
    this.logger.log(`Expires At: ${expiresAt}`);

    const expiryDays = Math.ceil(
      (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const emailPayload = {
      from: `Outpick Outlast <${this.fromEmail}>`,
      to: [to],
      subject: `You've been invited to join ${leagueName}!`,
      html: this.getInviteEmailHtml({
        leagueName,
        leagueDescription,
        inviterName,
        joinUrl,
        expiryDays,
      }),
    };

    this.logger.log(`Email payload prepared, sending via Resend...`);

    try {
      const result = await this.resend.emails.send(emailPayload);
      this.logger.log(`Resend API response: ${JSON.stringify(result)}`);
      this.logger.log(`=== INVITE EMAIL SENT SUCCESSFULLY ===`);
    } catch (error) {
      this.logger.error(`=== INVITE EMAIL FAILED ===`);
      this.logger.error(`Error type: ${error?.constructor?.name}`);
      this.logger.error(`Error message: ${error?.message}`);
      this.logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
  }

  private getInviteEmailHtml(params: {
    leagueName: string;
    leagueDescription?: string;
    inviterName: string;
    joinUrl: string;
    expiryDays: number;
  }): string {
    const logoUrl = 'https://res.cloudinary.com/dm2gfa9t8/image/upload/e_trim,h_80,c_fit,f_png,q_auto/main-logo';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: #14181F;
              color: #F8F6F2;
            }
            .wrapper {
              background: #14181F;
              padding: 40px 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
            }
            .header {
              background: linear-gradient(138deg, #212630 0%, #191D24 100%);
              padding: 32px;
              text-align: center;
              border-radius: 16px 16px 0 0;
              border: 1px solid rgba(48, 53, 65, 0.5);
              border-bottom: none;
            }
            .header img {
              height: 40px;
              width: auto;
            }
            .subheader {
              color: #818898;
              font-size: 13px;
              margin-top: 8px;
              letter-spacing: 1px;
              text-transform: uppercase;
            }
            .content {
              background: linear-gradient(138deg, #212630 0%, #191D24 100%);
              padding: 32px;
              border-radius: 0 0 16px 16px;
              border: 1px solid rgba(48, 53, 65, 0.5);
              border-top: none;
            }
            .content h2 {
              color: #F8F6F2;
              margin: 0 0 16px 0;
              font-size: 22px;
              font-weight: 600;
            }
            .content p {
              color: #818898;
              margin: 0 0 16px 0;
              font-size: 15px;
              line-height: 1.6;
            }
            .content strong {
              color: #F8F6F2;
            }
            .content ul {
              color: #818898;
              padding-left: 20px;
              margin: 16px 0;
            }
            .content li {
              margin: 8px 0;
              font-size: 15px;
            }
            .cta-button {
              display: inline-block;
              background: #F06542;
              color: #14181F !important;
              padding: 14px 28px;
              text-decoration: none;
              border-radius: 12px;
              margin: 24px 0;
              font-weight: 600;
              font-size: 15px;
              box-shadow: 0 4px 0 #C34322;
            }
            .expiry-note {
              background: rgba(249, 195, 31, 0.1);
              border: 1px solid rgba(249, 195, 31, 0.3);
              padding: 16px;
              border-radius: 12px;
              margin-top: 24px;
            }
            .expiry-note p {
              color: #F9C31F;
              margin: 0;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              padding: 24px;
              color: #818898;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <img src="${logoUrl}" alt="Outpick Outlast" />
                <div class="subheader">A Survivor Fantasy League</div>
              </div>
              <div class="content">
                <h2>You've been invited!</h2>
                <p><strong>${params.inviterName}</strong> has invited you to join <strong>${params.leagueName}</strong>.</p>
                ${params.leagueDescription ? `<p>${params.leagueDescription}</p>` : ''}
                <p>Join your league to:</p>
                <ul>
                  <li>Draft your favorite castaways</li>
                  <li>Compete with friends for points</li>
                  <li>Answer weekly questions</li>
                  <li>Track standings and scores</li>
                </ul>
                <center>
                  <a href="${params.joinUrl}" class="cta-button">Join League Now</a>
                </center>
                <div class="expiry-note">
                  <p>This invite expires in ${params.expiryDays} days. Don't wait!</p>
                </div>
              </div>
              <div class="footer">
                <p>Outpick Outlast</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
