-- CreateTable
CREATE TABLE "User" (
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

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueSeason" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,

    CONSTRAINT "LeagueSeason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoImageUrl" TEXT,
    "leagueSeasonId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "activeEpisode" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Castaway" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "imageUrl" TEXT,

    CONSTRAINT "Castaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamCastaway" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "castawayId" TEXT NOT NULL,
    "startEpisode" INTEGER NOT NULL,
    "endEpisode" INTEGER,

    CONSTRAINT "TeamCastaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "airDate" TIMESTAMP(3),
    "title" TEXT,

    CONSTRAINT "Episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueSeasonSettings" (
    "id" TEXT NOT NULL,
    "leagueSeasonId" TEXT NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueSeasonSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftConfig" (
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

-- CreateTable
CREATE TABLE "LeagueQuestion" (
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

-- CreateTable
CREATE TABLE "PlayerAnswer" (
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

-- CreateTable
CREATE TABLE "InviteToken" (
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

-- CreateTable
CREATE TABLE "RetentionConfig" (
    "id" TEXT NOT NULL,
    "leagueSeasonId" TEXT NOT NULL,
    "episodeNumber" INTEGER NOT NULL,
    "pointsPerCastaway" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RetentionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamEpisodePoints" (
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

-- CreateTable
CREATE TABLE "NotificationPreferences" (
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

-- CreateTable
CREATE TABLE "SentNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationType" TEXT NOT NULL,
    "leagueId" TEXT,
    "episodeNumber" INTEGER,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommissionerMessage" (
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

-- CreateTable
CREATE TABLE "CommissionerMessageDismissal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommissionerMessageDismissal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LeagueMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LeagueMembers_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LeagueCommissioners" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_LeagueCommissioners_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_lastViewedLeagueId_idx" ON "User"("lastViewedLeagueId");

-- CreateIndex
CREATE UNIQUE INDEX "League_slug_key" ON "League"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueSeason_leagueId_seasonId_key" ON "LeagueSeason"("leagueId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "Season_number_key" ON "Season"("number");

-- CreateIndex
CREATE UNIQUE INDEX "TeamCastaway_teamId_castawayId_startEpisode_key" ON "TeamCastaway"("teamId", "castawayId", "startEpisode");

-- CreateIndex
CREATE UNIQUE INDEX "Episode_seasonId_number_key" ON "Episode"("seasonId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueSeasonSettings_leagueSeasonId_key" ON "LeagueSeasonSettings"("leagueSeasonId");

-- CreateIndex
CREATE INDEX "DraftConfig_leagueSeasonId_idx" ON "DraftConfig"("leagueSeasonId");

-- CreateIndex
CREATE UNIQUE INDEX "DraftConfig_leagueSeasonId_roundNumber_key" ON "DraftConfig"("leagueSeasonId", "roundNumber");

-- CreateIndex
CREATE INDEX "LeagueQuestion_leagueSeasonId_episodeNumber_idx" ON "LeagueQuestion"("leagueSeasonId", "episodeNumber");

-- CreateIndex
CREATE INDEX "PlayerAnswer_teamId_idx" ON "PlayerAnswer"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerAnswer_leagueQuestionId_teamId_key" ON "PlayerAnswer"("leagueQuestionId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "InviteToken_token_key" ON "InviteToken"("token");

-- CreateIndex
CREATE INDEX "InviteToken_token_idx" ON "InviteToken"("token");

-- CreateIndex
CREATE INDEX "InviteToken_leagueId_idx" ON "InviteToken"("leagueId");

-- CreateIndex
CREATE INDEX "InviteToken_invitedEmail_idx" ON "InviteToken"("invitedEmail");

-- CreateIndex
CREATE INDEX "RetentionConfig_leagueSeasonId_idx" ON "RetentionConfig"("leagueSeasonId");

-- CreateIndex
CREATE UNIQUE INDEX "RetentionConfig_leagueSeasonId_episodeNumber_key" ON "RetentionConfig"("leagueSeasonId", "episodeNumber");

-- CreateIndex
CREATE INDEX "TeamEpisodePoints_teamId_idx" ON "TeamEpisodePoints"("teamId");

-- CreateIndex
CREATE INDEX "TeamEpisodePoints_episodeNumber_idx" ON "TeamEpisodePoints"("episodeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TeamEpisodePoints_teamId_episodeNumber_key" ON "TeamEpisodePoints"("teamId", "episodeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_userId_key" ON "NotificationPreferences"("userId");

-- CreateIndex
CREATE INDEX "SentNotification_userId_idx" ON "SentNotification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SentNotification_userId_notificationType_leagueId_episodeNu_key" ON "SentNotification"("userId", "notificationType", "leagueId", "episodeNumber");

-- CreateIndex
CREATE INDEX "CommissionerMessage_leagueId_createdAt_idx" ON "CommissionerMessage"("leagueId", "createdAt");

-- CreateIndex
CREATE INDEX "CommissionerMessageDismissal_userId_idx" ON "CommissionerMessageDismissal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionerMessageDismissal_userId_messageId_key" ON "CommissionerMessageDismissal"("userId", "messageId");

-- CreateIndex
CREATE INDEX "_LeagueMembers_B_index" ON "_LeagueMembers"("B");

-- CreateIndex
CREATE INDEX "_LeagueCommissioners_B_index" ON "_LeagueCommissioners"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_lastViewedLeagueId_fkey" FOREIGN KEY ("lastViewedLeagueId") REFERENCES "League"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSeason" ADD CONSTRAINT "LeagueSeason_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSeason" ADD CONSTRAINT "LeagueSeason_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Castaway" ADD CONSTRAINT "Castaway_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamCastaway" ADD CONSTRAINT "TeamCastaway_castawayId_fkey" FOREIGN KEY ("castawayId") REFERENCES "Castaway"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamCastaway" ADD CONSTRAINT "TeamCastaway_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Episode" ADD CONSTRAINT "Episode_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueSeasonSettings" ADD CONSTRAINT "LeagueSeasonSettings_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftConfig" ADD CONSTRAINT "DraftConfig_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueQuestion" ADD CONSTRAINT "LeagueQuestion_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_leagueQuestionId_fkey" FOREIGN KEY ("leagueQuestionId") REFERENCES "LeagueQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerAnswer" ADD CONSTRAINT "PlayerAnswer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteToken" ADD CONSTRAINT "InviteToken_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionConfig" ADD CONSTRAINT "RetentionConfig_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamEpisodePoints" ADD CONSTRAINT "TeamEpisodePoints_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentNotification" ADD CONSTRAINT "SentNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionerMessage" ADD CONSTRAINT "CommissionerMessage_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionerMessage" ADD CONSTRAINT "CommissionerMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionerMessageDismissal" ADD CONSTRAINT "CommissionerMessageDismissal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionerMessageDismissal" ADD CONSTRAINT "CommissionerMessageDismissal_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "CommissionerMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeagueMembers" ADD CONSTRAINT "_LeagueMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeagueMembers" ADD CONSTRAINT "_LeagueMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeagueCommissioners" ADD CONSTRAINT "_LeagueCommissioners_A_fkey" FOREIGN KEY ("A") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeagueCommissioners" ADD CONSTRAINT "_LeagueCommissioners_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

