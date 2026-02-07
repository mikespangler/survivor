# Email Templates for Resend

These HTML templates are ready to use with Resend. Each template uses `{{variable}}` syntax for dynamic content.

## Templates

### 1. Questions Reminder (`questions-reminder.html`)
Sent to players to remind them to submit answers before the episode airs.

**Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `{{userName}}` | User's display name | "Mike" |
| `{{leagueName}}` | Name of the league | "Office Survivor League" |
| `{{episodeNumber}}` | Episode number | "5" |
| `{{deadline}}` | Formatted deadline | "Wednesday, February 12, 2026 at 8:00 PM EST" |
| `{{questionsRemaining}}` | Unanswered questions count | "3" |
| `{{answeredCount}}` | Questions answered | "2" |
| `{{questionsCount}}` | Total questions | "5" |
| `{{questionsUrl}}` | Link to questions page | "https://app.com/leagues/123/questions?episode=5" |
| `{{preferencesUrl}}` | Link to preferences | "https://app.com/profile" |

---

### 2. Draft Reminder (`draft-reminder.html`)
Sent to players to remind them to complete their draft.

**Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `{{userName}}` | User's display name | "Mike" |
| `{{leagueName}}` | Name of the league | "Office Survivor League" |
| `{{draftDate}}` | Formatted draft deadline | "Wednesday, February 12, 2026 at 8:00 PM EST" |
| `{{roundNumber}}` | Draft round number | "1" |
| `{{castawaysPerTeam}}` | Castaways to select | "4" |
| `{{draftUrl}}` | Link to draft page | "https://app.com/leagues/123/draft?round=1" |
| `{{preferencesUrl}}` | Link to preferences | "https://app.com/profile" |

---

### 3. Results Available (`results-available.html`)
Sent to players when episode results have been scored.

**Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `{{userName}}` | User's display name | "Mike" |
| `{{leagueName}}` | Name of the league | "Office Survivor League" |
| `{{episodeNumber}}` | Episode number | "5" |
| `{{userPoints}}` | Points earned this episode | "12" |
| `{{userRank}}` | User's rank for episode | "2" |
| `{{totalTeams}}` | Total teams in league | "8" |
| `{{resultsUrl}}` | Link to results page | "https://app.com/leagues/123/results?episode=5" |
| `{{preferencesUrl}}` | Link to preferences | "https://app.com/profile" |

---

### 4. Scoring Reminder (`scoring-reminder.html`)
Sent to commissioners when questions need to be scored.

**Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `{{userName}}` | Commissioner's display name | "Mike" |
| `{{leagueName}}` | Name of the league | "Office Survivor League" |
| `{{episodeNumber}}` | Episode number | "5" |
| `{{scoredQuestions}}` | Questions already scored | "2" |
| `{{totalQuestions}}` | Total questions to score | "5" |
| `{{progressPercent}}` | Scoring progress (0-100) | "40" |
| `{{scoringUrl}}` | Link to scoring page | "https://app.com/leagues/123/settings/questions?episode=5" |
| `{{preferencesUrl}}` | Link to preferences | "https://app.com/profile" |

---

### 5. Questions Setup Reminder (`questions-setup-reminder.html`)
Sent to commissioners when questions haven't been created for an upcoming episode.

**Variables:**
| Variable | Description | Example |
|----------|-------------|---------|
| `{{userName}}` | Commissioner's display name | "Mike" |
| `{{leagueName}}` | Name of the league | "Office Survivor League" |
| `{{episodeNumber}}` | Episode number | "5" |
| `{{airDate}}` | Formatted air date | "Wednesday, February 12, 2026 at 8:00 PM EST" |
| `{{setupUrl}}` | Link to questions setup | "https://app.com/leagues/123/settings/questions?episode=5" |
| `{{preferencesUrl}}` | Link to preferences | "https://app.com/profile" |

---

## Styling

All templates use consistent branding:
- **Primary Color:** `#F06542` (Orange)
- **Font:** Helvetica Neue, Arial, sans-serif
- **Max Width:** 600px

## Testing

To test templates in Resend:
1. Go to your Resend dashboard
2. Create a new email template
3. Paste the HTML content
4. Use the preview feature with test data
