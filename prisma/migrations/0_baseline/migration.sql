-- Idempotent baseline migration
-- Safe to run on both fresh databases and existing production databases

-- ============================================================================
-- TABLES (CREATE TABLE IF NOT EXISTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "systemRole" TEXT NOT NULL DEFAULT 'user',
    "lastViewedLeagueId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "League" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeagueSeason" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    CONSTRAINT "LeagueSeason_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoImageUrl" TEXT,
    "leagueSeasonId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Season" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "activeEpisode" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Castaway" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "imageUrl" TEXT,
    CONSTRAINT "Castaway_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TeamCastaway" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "castawayId" TEXT NOT NULL,
    "startEpisode" INTEGER NOT NULL,
    "endEpisode" INTEGER,
    CONSTRAINT "TeamCastaway_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Episode" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "airDate" TIMESTAMP(3),
    "title" TEXT,
    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeagueSeasonSettings" (
    "id" TEXT NOT NULL,
    "leagueSeasonId" TEXT NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeagueSeasonSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "DraftConfig" (
    "id" TEXT NOT NULL,
    "leagueSeasonId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL DEFAULT 1,
    "castawaysPerTeam" INTEGER NOT NULL,
    "draftDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DraftConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeagueQuestion" (
    "id" TEXT NOT NULL,
    "leagueSeasonId" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "pointValue" INTEGER NOT NULL DEFAULT 1,
    "correctAnswer" TEXT,
    "isScored" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "questionScope" TEXT NOT NULL DEFAULT 'episode',
    "isWager" BOOLEAN NOT NULL DEFAULT false,
    "minWager" INTEGER,
    "maxWager" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LeagueQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PlayerAnswer" (
    "id" TEXT NOT NULL,
    "leagueQuestionId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "wagerAmount" INTEGER,
    "pointsEarned" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlayerAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InviteToken" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedById" TEXT,
    "invitedEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InviteToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "RetentionConfig" (
    "id" TEXT NOT NULL,
    "leagueSeasonId" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "pointsPerCastaway" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RetentionConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TeamEpisodePoints" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "questionPoints" INTEGER NOT NULL DEFAULT 0,
    "retentionPoints" INTEGER NOT NULL DEFAULT 0,
    "totalEpisodePoints" INTEGER NOT NULL DEFAULT 0,
    "runningTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TeamEpisodePoints_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "NotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weeklyQuestionsReminder" BOOLEAN NOT NULL DEFAULT true,
    "draftReminder" BOOLEAN NOT NULL DEFAULT true,
    "resultsAvailable" BOOLEAN NOT NULL DEFAULT true,
    "commissionerMessages" BOOLEAN NOT NULL DEFAULT true,
    "scoringReminder" BOOLEAN NOT NULL DEFAULT true,
    "questionsSetupReminder" BOOLEAN NOT NULL DEFAULT true,
    "emailFrequency" TEXT NOT NULL DEFAULT 'immediate',
    "reminderHoursBefore" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SentNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "leagueId" TEXT,
    "episodeNumber" INTEGER,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SentNotification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CommissionerMessage" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "contentPlain" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommissionerMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CommissionerMessageDismissal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommissionerMessageDismissal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "_LeagueMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LeagueMembers_AB_pkey" PRIMARY KEY ("A","B")
);

CREATE TABLE IF NOT EXISTS "_LeagueCommissioners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_LeagueCommissioners_AB_pkey" PRIMARY KEY ("A","B")
);

-- ============================================================================
-- ADD COLUMNS IF NOT EXISTS (handles existing tables missing newer columns)
-- ============================================================================

-- League columns that may be missing on production
ALTER TABLE "League" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "League" ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- Backfill slug for any existing rows that have NULL slug (use id as fallback)
UPDATE "League" SET "slug" = "id" WHERE "slug" IS NULL;

-- Now make slug NOT NULL (idempotent: will no-op if already NOT NULL)
ALTER TABLE "League" ALTER COLUMN "slug" SET NOT NULL;

-- ============================================================================
-- INDEXES (CREATE INDEX IF NOT EXISTS / CREATE UNIQUE INDEX IF NOT EXISTS)
-- ============================================================================

-- User indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_clerkId_idx" ON "User"("clerkId");
CREATE INDEX IF NOT EXISTS "User_lastViewedLeagueId_idx" ON "User"("lastViewedLeagueId");

-- League indexes
CREATE UNIQUE INDEX IF NOT EXISTS "League_slug_key" ON "League"("slug");

-- LeagueSeason indexes
CREATE UNIQUE INDEX IF NOT EXISTS "LeagueSeason_leagueId_seasonId_key" ON "LeagueSeason"("leagueId", "seasonId");

-- Season indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Season_number_key" ON "Season"("number");

-- TeamCastaway indexes
CREATE UNIQUE INDEX IF NOT EXISTS "TeamCastaway_teamId_castawayId_startEpisode_key" ON "TeamCastaway"("teamId", "castawayId", "startEpisode");

-- Episode indexes
CREATE UNIQUE INDEX IF NOT EXISTS "Episode_seasonId_number_key" ON "Episode"("seasonId", "number");

-- LeagueSeasonSettings indexes
CREATE UNIQUE INDEX IF NOT EXISTS "LeagueSeasonSettings_leagueSeasonId_key" ON "LeagueSeasonSettings"("leagueSeasonId");

-- DraftConfig indexes
CREATE INDEX IF NOT EXISTS "DraftConfig_leagueSeasonId_idx" ON "DraftConfig"("leagueSeasonId");
CREATE UNIQUE INDEX IF NOT EXISTS "DraftConfig_leagueSeasonId_roundNumber_key" ON "DraftConfig"("leagueSeasonId", "roundNumber");

-- LeagueQuestion indexes
CREATE INDEX IF NOT EXISTS "LeagueQuestion_leagueSeasonId_episodeNumber_idx" ON "LeagueQuestion"("leagueSeasonId", "episodeNumber");

-- PlayerAnswer indexes
CREATE INDEX IF NOT EXISTS "PlayerAnswer_teamId_idx" ON "PlayerAnswer"("teamId");
CREATE UNIQUE INDEX IF NOT EXISTS "PlayerAnswer_leagueQuestionId_teamId_key" ON "PlayerAnswer"("leagueQuestionId", "teamId");

-- InviteToken indexes
CREATE UNIQUE INDEX IF NOT EXISTS "InviteToken_token_key" ON "InviteToken"("token");
CREATE INDEX IF NOT EXISTS "InviteToken_token_idx" ON "InviteToken"("token");
CREATE INDEX IF NOT EXISTS "InviteToken_leagueId_idx" ON "InviteToken"("leagueId");
CREATE INDEX IF NOT EXISTS "InviteToken_invitedEmail_idx" ON "InviteToken"("invitedEmail");

-- RetentionConfig indexes
CREATE INDEX IF NOT EXISTS "RetentionConfig_leagueSeasonId_idx" ON "RetentionConfig"("leagueSeasonId");
CREATE UNIQUE INDEX IF NOT EXISTS "RetentionConfig_leagueSeasonId_episodeNumber_key" ON "RetentionConfig"("leagueSeasonId", "episodeNumber");

-- TeamEpisodePoints indexes
CREATE INDEX IF NOT EXISTS "TeamEpisodePoints_teamId_idx" ON "TeamEpisodePoints"("teamId");
CREATE INDEX IF NOT EXISTS "TeamEpisodePoints_episodeNumber_idx" ON "TeamEpisodePoints"("episodeNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "TeamEpisodePoints_teamId_episodeNumber_key" ON "TeamEpisodePoints"("teamId", "episodeNumber");

-- NotificationPreferences indexes
CREATE UNIQUE INDEX IF NOT EXISTS "NotificationPreferences_userId_key" ON "NotificationPreferences"("userId");

-- SentNotification indexes
CREATE INDEX IF NOT EXISTS "SentNotification_userId_idx" ON "SentNotification"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "SentNotification_userId_notificationType_leagueId_episodeNu_key" ON "SentNotification"("userId", "notificationType", "leagueId", "episodeNumber");

-- CommissionerMessage indexes
CREATE INDEX IF NOT EXISTS "CommissionerMessage_leagueId_createdAt_idx" ON "CommissionerMessage"("leagueId", "createdAt");

-- CommissionerMessageDismissal indexes
CREATE INDEX IF NOT EXISTS "CommissionerMessageDismissal_userId_idx" ON "CommissionerMessageDismissal"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "CommissionerMessageDismissal_userId_messageId_key" ON "CommissionerMessageDismissal"("userId", "messageId");

-- Join table indexes
CREATE INDEX IF NOT EXISTS "_LeagueMembers_B_index" ON "_LeagueMembers"("B");
CREATE INDEX IF NOT EXISTS "_LeagueCommissioners_B_index" ON "_LeagueCommissioners"("B");

-- ============================================================================
-- FOREIGN KEYS (wrapped in DO blocks to handle already-existing constraints)
-- ============================================================================

DO $$ BEGIN
    ALTER TABLE "User" ADD CONSTRAINT "User_lastViewedLeagueId_fkey"
        FOREIGN KEY ("lastViewedLeagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "League" ADD CONSTRAINT "League_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "LeagueSeason" ADD CONSTRAINT "LeagueSeason_leagueId_fkey"
        FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "LeagueSeason" ADD CONSTRAINT "LeagueSeason_seasonId_fkey"
        FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Team" ADD CONSTRAINT "Team_leagueSeasonId_fkey"
        FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Castaway" ADD CONSTRAINT "Castaway_seasonId_fkey"
        FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "TeamCastaway" ADD CONSTRAINT "TeamCastaway_castawayId_fkey"
        FOREIGN KEY ("castawayId") REFERENCES "Castaway"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "TeamCastaway" ADD CONSTRAINT "TeamCastaway_teamId_fkey"
        FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey"
        FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "LeagueSeasonSettings" ADD CONSTRAINT "LeagueSeasonSettings_leagueSeasonId_fkey"
        FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "DraftConfig" ADD CONSTRAINT "DraftConfig_leagueSeasonId_fkey"
        FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "LeagueQuestion" ADD CONSTRAINT "LeagueQuestion_leagueSeasonId_fkey"
        FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_leagueQuestionId_fkey"
        FOREIGN KEY ("leagueQuestionId") REFERENCES "LeagueQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_teamId_fkey"
        FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_leagueId_fkey"
        FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_createdById_fkey"
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "RetentionConfig" ADD CONSTRAINT "RetentionConfig_leagueSeasonId_fkey"
        FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "TeamEpisodePoints" ADD CONSTRAINT "TeamEpisodePoints_teamId_fkey"
        FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "SentNotification" ADD CONSTRAINT "SentNotification_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "CommissionerMessage" ADD CONSTRAINT "CommissionerMessage_leagueId_fkey"
        FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "CommissionerMessage" ADD CONSTRAINT "CommissionerMessage_authorId_fkey"
        FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "CommissionerMessageDismissal" ADD CONSTRAINT "CommissionerMessageDismissal_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "CommissionerMessageDismissal" ADD CONSTRAINT "CommissionerMessageDismissal_messageId_fkey"
        FOREIGN KEY ("messageId") REFERENCES "CommissionerMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "_LeagueMembers" ADD CONSTRAINT "_LeagueMembers_A_fkey"
        FOREIGN KEY ("A") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "_LeagueMembers" ADD CONSTRAINT "_LeagueMembers_B_fkey"
        FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "_LeagueCommissioners" ADD CONSTRAINT "_LeagueCommissioners_A_fkey"
        FOREIGN KEY ("A") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "_LeagueCommissioners" ADD CONSTRAINT "_LeagueCommissioners_B_fkey"
        FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
