import { getBaseEmailHtml } from './base.template';

export interface QuestionsSetupReminderParams {
  userName: string;
  leagueName: string;
  episodeNumber: number;
  setupUrl: string;
  preferencesUrl: string;
  airDate?: Date;
}

export function getQuestionsSetupReminderHtml(
  params: QuestionsSetupReminderParams,
): string {
  const {
    userName,
    leagueName,
    episodeNumber,
    setupUrl,
    preferencesUrl,
    airDate,
  } = params;

  const airDateStr = airDate
    ? airDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : null;

  const content = `
    <h2>Hey ${userName || 'there'}!</h2>
    <p>
      <strong>Episode ${episodeNumber}</strong> questions haven't been set up yet for <strong>${leagueName}</strong>.
    </p>

    ${
      airDateStr
        ? `
      <div class="deadline">
        <strong>Episode airs:</strong> ${airDateStr}
      </div>
    `
        : ''
    }

    <div class="info-box">
      Players won't be able to submit their predictions until questions are created!
    </div>

    <center>
      <a href="${setupUrl}" class="cta-button">Create Questions</a>
    </center>

    <p style="font-size: 14px; margin-top: 24px;">
      Tip: You can quickly add questions from templates or create custom ones.
    </p>
  `;

  return getBaseEmailHtml(content, preferencesUrl);
}
