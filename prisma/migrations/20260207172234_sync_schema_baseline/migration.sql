-- Baseline migration to sync schema with existing database state
-- This captures all changes made via `prisma db push` that weren't in migrations

-- Add columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastViewedLeagueId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "systemRole" TEXT NOT NULL DEFAULT 'user';
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;

-- Add clerkId unique constraint and indexes
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");
CREATE INDEX IF NOT EXISTS "User_clerkId_idx" ON "User"("clerkId");
CREATE INDEX IF NOT EXISTS "User_lastViewedLeagueId_idx" ON "User"("lastViewedLeagueId");

-- Add column to Castaway table
ALTER TABLE "Castaway" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- Add columns to Season table
ALTER TABLE "Season" ADD COLUMN IF NOT EXISTS "activeEpisode" INTEGER NOT NULL DEFAULT 1;

-- Add columns to Team table
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "logoImageUrl" TEXT;

-- Modify TeamCastaway table
ALTER TABLE "TeamCastaway" ADD COLUMN IF NOT EXISTS "startEpisode" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "TeamCastaway" ADD COLUMN IF NOT EXISTS "endEpisode" INTEGER;
DROP INDEX IF EXISTS "TeamCastaway_teamId_castawayId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "TeamCastaway_teamId_castawayId_startEpisode_key" ON "TeamCastaway"("teamId", "castawayId", "startEpisode");

-- Create InviteToken table
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

-- Add invitedEmail column if table already exists (for existing databases)
ALTER TABLE "InviteToken" ADD COLUMN IF NOT EXISTS "invitedEmail" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "InviteToken_token_key" ON "InviteToken"("token");
CREATE INDEX IF NOT EXISTS "InviteToken_token_idx" ON "InviteToken"("token");
CREATE INDEX IF NOT EXISTS "InviteToken_leagueId_idx" ON "InviteToken"("leagueId");
CREATE INDEX IF NOT EXISTS "InviteToken_invitedEmail_idx" ON "InviteToken"("invitedEmail");

-- Create QuestionTemplate table
CREATE TABLE IF NOT EXISTS "QuestionTemplate" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "options" JSONB,
    "pointValue" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "QuestionTemplate_category_idx" ON "QuestionTemplate"("category");

-- Create LeagueQuestion table
CREATE TABLE IF NOT EXISTS "LeagueQuestion" (
    "id" TEXT NOT NULL,
    "leagueSeasonId" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "templateId" TEXT,
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

CREATE INDEX IF NOT EXISTS "LeagueQuestion_leagueSeasonId_episodeNumber_idx" ON "LeagueQuestion"("leagueSeasonId", "episodeNumber");

-- Create PlayerAnswer table
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

CREATE UNIQUE INDEX IF NOT EXISTS "PlayerAnswer_leagueQuestionId_teamId_key" ON "PlayerAnswer"("leagueQuestionId", "teamId");
CREATE INDEX IF NOT EXISTS "PlayerAnswer_teamId_idx" ON "PlayerAnswer"("teamId");

-- Create RetentionConfig table
CREATE TABLE IF NOT EXISTS "RetentionConfig" (
    "id" TEXT NOT NULL,
    "leagueSeasonId" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "pointsPerCastaway" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetentionConfig_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "RetentionConfig_leagueSeasonId_episodeNumber_key" ON "RetentionConfig"("leagueSeasonId", "episodeNumber");
CREATE INDEX IF NOT EXISTS "RetentionConfig_leagueSeasonId_idx" ON "RetentionConfig"("leagueSeasonId");

-- Create TeamEpisodePoints table
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

CREATE UNIQUE INDEX IF NOT EXISTS "TeamEpisodePoints_teamId_episodeNumber_key" ON "TeamEpisodePoints"("teamId", "episodeNumber");
CREATE INDEX IF NOT EXISTS "TeamEpisodePoints_teamId_idx" ON "TeamEpisodePoints"("teamId");
CREATE INDEX IF NOT EXISTS "TeamEpisodePoints_episodeNumber_idx" ON "TeamEpisodePoints"("episodeNumber");

-- Create NotificationPreferences table
CREATE TABLE IF NOT EXISTS "NotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weeklyQuestionsReminder" BOOLEAN NOT NULL DEFAULT true,
    "draftReminder" BOOLEAN NOT NULL DEFAULT true,
    "resultsAvailable" BOOLEAN NOT NULL DEFAULT true,
    "scoringReminder" BOOLEAN NOT NULL DEFAULT true,
    "questionsSetupReminder" BOOLEAN NOT NULL DEFAULT true,
    "emailFrequency" TEXT NOT NULL DEFAULT 'immediate',
    "reminderHoursBefore" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "NotificationPreferences_userId_key" ON "NotificationPreferences"("userId");

-- Create SentNotification table
CREATE TABLE IF NOT EXISTS "SentNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "leagueId" TEXT,
    "episodeNumber" INTEGER,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentNotification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SentNotification_userId_notificationType_leagueId_episodeNumber_key" ON "SentNotification"("userId", "notificationType", "leagueId", "episodeNumber");
CREATE INDEX IF NOT EXISTS "SentNotification_userId_idx" ON "SentNotification"("userId");

-- Create _LeagueCommissioners join table
CREATE TABLE IF NOT EXISTS "_LeagueCommissioners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "_LeagueCommissioners_AB_unique" ON "_LeagueCommissioners"("A", "B");
CREATE INDEX IF NOT EXISTS "_LeagueCommissioners_B_index" ON "_LeagueCommissioners"("B");

-- Add foreign keys (using DO blocks to handle IF NOT EXISTS for constraints)
DO $$ BEGIN
    ALTER TABLE "User" ADD CONSTRAINT "User_lastViewedLeagueId_fkey" FOREIGN KEY ("lastViewedLeagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "QuestionTemplate" ADD CONSTRAINT "QuestionTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "LeagueQuestion" ADD CONSTRAINT "LeagueQuestion_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "LeagueQuestion" ADD CONSTRAINT "LeagueQuestion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuestionTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_leagueQuestionId_fkey" FOREIGN KEY ("leagueQuestionId") REFERENCES "LeagueQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "RetentionConfig" ADD CONSTRAINT "RetentionConfig_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "TeamEpisodePoints" ADD CONSTRAINT "TeamEpisodePoints_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "SentNotification" ADD CONSTRAINT "SentNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "_LeagueCommissioners" ADD CONSTRAINT "_LeagueCommissioners_A_fkey" FOREIGN KEY ("A") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "_LeagueCommissioners" ADD CONSTRAINT "_LeagueCommissioners_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
