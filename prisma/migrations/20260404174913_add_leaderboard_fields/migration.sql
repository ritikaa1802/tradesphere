-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "showOnLeaderboard" BOOLEAN NOT NULL DEFAULT false;
