import { getBaseEmailHtml } from './base.template';

export interface CommissionerMessageParams {
  userName: string;
  leagueName: string;
  authorName: string;
  messageTitle: string;
  messageContent: string; // Plain text content
  messageUrl: string;
  preferencesUrl: string;
}

export function getCommissionerMessageHtml(
  params: CommissionerMessageParams,
): string {
  const {
    userName,
    leagueName,
    authorName,
    messageTitle,
    messageContent,
    messageUrl,
    preferencesUrl,
  } = params;

  // Escape HTML and convert newlines to <br>
  const escapedContent = messageContent
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  const content = `
    <h2>Hey ${userName || 'there'}!</h2>
    <p><strong>${authorName}</strong> posted a new announcement in <strong>${leagueName}</strong>:</p>

    <div style="background: rgba(240, 101, 66, 0.1); border: 1px solid rgba(240, 101, 66, 0.3); padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="color: #F8F6F2; margin: 0 0 12px 0; font-size: 18px;">${messageTitle}</h3>
      <p style="color: #818898; margin: 0; white-space: pre-wrap; line-height: 1.6;">${escapedContent}</p>
    </div>

    <center>
      <a href="${messageUrl}" class="cta-button">
        View in League
      </a>
    </center>

    <p style="font-size: 14px; margin-top: 24px; color: #818898;">
      This message was sent by a league commissioner.
    </p>
  `;

  return getBaseEmailHtml(content, preferencesUrl);
}
