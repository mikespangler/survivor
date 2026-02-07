import { getBaseEmailHtml } from './base.template';

export interface ScoringReminderParams {
  userName: string;
  leagueName: string;
  episodeNumber: number;
  scoringUrl: string;
  preferencesUrl: string;
  totalQuestions: number;
  scoredQuestions: number;
}

export function getScoringReminderHtml(params: ScoringReminderParams): string {
  const {
    userName,
    leagueName,
    episodeNumber,
    scoringUrl,
    preferencesUrl,
    totalQuestions,
    scoredQuestions,
  } = params;

  const remaining = totalQuestions - scoredQuestions;
  const isPartiallyScored = scoredQuestions > 0;

  const content = `
    <h2>Hey ${userName || 'there'}!</h2>
    <p>
      ${isPartiallyScored
        ? `You have unfinished scoring for <strong>Episode ${episodeNumber}</strong> in <strong>${leagueName}</strong>.`
        : `Episode ${episodeNumber} has aired! It's time to score the questions for <strong>${leagueName}</strong>.`
      }
    </p>

    <div class="info-box">
      ${isPartiallyScored
        ? `<strong>${scoredQuestions} of ${totalQuestions}</strong> questions scored - <strong>${remaining} remaining</strong>`
        : `<strong>${totalQuestions} question${totalQuestions === 1 ? '' : 's'}</strong> ready to score`
      }
    </div>

    <center>
      <a href="${scoringUrl}" class="cta-button">
        ${isPartiallyScored ? 'Continue Scoring' : 'Score Questions'}
      </a>
    </center>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      Players are waiting to see their results!
    </p>
  `;

  return getBaseEmailHtml(content, preferencesUrl);
}
