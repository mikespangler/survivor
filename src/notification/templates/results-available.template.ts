import { getBaseEmailHtml } from './base.template';

export interface ResultsAvailableParams {
  userName: string;
  leagueName: string;
  episodeNumber: number;
  resultsUrl: string;
  preferencesUrl: string;
  userPoints?: number;
  userRank?: number;
  totalTeams?: number;
}

export function getResultsAvailableHtml(
  params: ResultsAvailableParams,
): string {
  const {
    userName,
    leagueName,
    episodeNumber,
    resultsUrl,
    preferencesUrl,
    userPoints,
    userRank,
    totalTeams,
  } = params;

  const hasStats = userPoints !== undefined && userRank !== undefined;

  const content = `
    <h2>Hey ${userName || 'there'}!</h2>
    <p>Results are in for <strong>Episode ${episodeNumber}</strong> in <strong>${leagueName}</strong>!</p>

    ${
      hasStats
        ? `
      <div class="info-box">
        <p style="margin: 0 0 10px 0;"><strong>Your Episode ${episodeNumber} Performance:</strong></p>
        <p style="margin: 0; font-size: 24px;">
          <strong>${userPoints} points</strong>
        </p>
        ${
          userRank && totalTeams
            ? `
          <p style="margin: 10px 0 0 0;">
            Rank: ${userRank} of ${totalTeams}
          </p>
        `
            : ''
        }
      </div>
    `
        : ''
    }

    <center>
      <a href="${resultsUrl}" class="cta-button">View Full Results</a>
    </center>

    <p style="font-size: 14px; margin-top: 24px;">
      See how you stack up against the competition!
    </p>
  `;

  return getBaseEmailHtml(content, preferencesUrl);
}
