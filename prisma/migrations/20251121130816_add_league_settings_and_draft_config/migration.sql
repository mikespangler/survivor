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

-- CreateIndex
CREATE UNIQUE INDEX "LeagueSeasonSettings_leagueSeasonId_key" ON "LeagueSeasonSettings"("leagueSeasonId");

-- CreateIndex
CREATE UNIQUE INDEX "DraftConfig_leagueSeasonId_roundNumber_key" ON "DraftConfig"("leagueSeasonId", "roundNumber");

-- CreateIndex
CREATE INDEX "DraftConfig_leagueSeasonId_idx" ON "DraftConfig"("leagueSeasonId");

-- AddForeignKey
ALTER TABLE "LeagueSeasonSettings" ADD CONSTRAINT "LeagueSeasonSettings_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DraftConfig" ADD CONSTRAINT "DraftConfig_leagueSeasonId_fkey" FOREIGN KEY ("leagueSeasonId") REFERENCES "LeagueSeason"("id") ON DELETE CASCADE ON UPDATE CASCADE;

