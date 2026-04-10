-- AlterTable
ALTER TABLE "AccountabilityPair" ADD COLUMN     "requesterId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

UPDATE "AccountabilityPair"
SET "requesterId" = "user1Id",
    "status" = 'accepted'
WHERE "requesterId" IS NULL;

ALTER TABLE "AccountabilityPair"
ALTER COLUMN "requesterId" SET NOT NULL;
