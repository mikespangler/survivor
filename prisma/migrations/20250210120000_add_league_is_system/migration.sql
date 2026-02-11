-- Add isSystem column to League table (may already exist from baseline)
ALTER TABLE "League" ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false;
