-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "emotionalState" TEXT,
ADD COLUMN     "followedPlan" TEXT,
ADD COLUMN     "tradeReason" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "shownLessons" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mission_userId_missionNumber_key" ON "Mission"("userId", "missionNumber");

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
