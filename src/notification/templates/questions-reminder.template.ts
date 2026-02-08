import { getBaseEmailHtml } from './base.template';

export interface QuestionsReminderParams {
  userName: string;
  leagueName: string;
  episodeNumber: number;
  deadline: Date;
  questionsUrl: string;
  preferencesUrl: string;
  questionsCount: number;
  answeredCount: number;
}

export function getQuestionsReminderHtml(
  params: QuestionsReminderParams,
): string {
  const {
    userName,
    leagueName,
    episodeNumber,
    deadline,
    questionsUrl,
    preferencesUrl,
    questionsCount,
    answeredCount,
  } = params;

  const remaining = questionsCount - answeredCount;
  const deadlineStr = deadline.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const content = `
    <h2>Hey ${userName || 'there'}!</h2>
    <p>Don't forget to submit your answers for <strong>Episode ${episodeNumber}</strong> in <strong>${leagueName}</strong>.</p>

    <div class="deadline">
      <strong>Deadline:</strong> ${deadlineStr}
    </div>

    ${
      remaining > 0
        ? `
      <div class="info-box">
        <strong>${remaining} question${remaining === 1 ? '' : 's'}</strong> remaining to answer
        ${answeredCount > 0 ? `(${answeredCount} of ${questionsCount} completed)` : ''}
      </div>
    `
        : `
      <div class="info-box">
        You've answered all questions! Review your answers before the deadline.
      </div>
    `
    }

    <center>
      <a href="${questionsUrl}" class="cta-button">
        ${remaining > 0 ? 'Answer Questions' : 'Review Answers'}
      </a>
    </center>

    <p style="font-size: 14px; margin-top: 24px;">
      Make sure to submit before the episode airs to earn points!
    </p>
  `;

  return getBaseEmailHtml(content, preferencesUrl);
}
