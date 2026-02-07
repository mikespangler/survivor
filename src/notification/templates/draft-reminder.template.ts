import { getBaseEmailHtml } from './base.template';

export interface DraftReminderParams {
  userName: string;
  leagueName: string;
  draftDate: Date;
  draftUrl: string;
  preferencesUrl: string;
  castawaysPerTeam: number;
  roundNumber: number;
}

export function getDraftReminderHtml(params: DraftReminderParams): string {
  const {
    userName,
    leagueName,
    draftDate,
    draftUrl,
    preferencesUrl,
    castawaysPerTeam,
    roundNumber,
  } = params;

  const deadlineStr = draftDate.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const content = `
    <h2>Hey ${userName || 'there'}!</h2>
    <p>The draft for <strong>${leagueName}</strong> is coming up!</p>

    <div class="deadline">
      <strong>Draft Deadline:</strong> ${deadlineStr}
    </div>

    <div class="info-box">
      <strong>Round ${roundNumber}</strong> - Select ${castawaysPerTeam} castaway${castawaysPerTeam === 1 ? '' : 's'} for your team
    </div>

    <center>
      <a href="${draftUrl}" class="cta-button">Complete Your Draft</a>
    </center>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      Don't miss out on building your dream team!
    </p>
  `;

  return getBaseEmailHtml(content, preferencesUrl);
}
