-- AlterTable
ALTER TABLE "User" ADD COLUMN     "proGrantedByChallenge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proUnlockedUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CohortChallenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxParticipants" INTEGER NOT NULL DEFAULT 100,
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CohortChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CohortEntry" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disciplineScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTrades" INTEGER NOT NULL DEFAULT 0,
    "ruleBreaks" INTEGER NOT NULL DEFAULT 0,
    "checklistCompletion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rank" INTEGER,

    CONSTRAINT "CohortEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyChampion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "disciplineScore" DOUBLE PRECISION NOT NULL,
    "proUnlockedUntil" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyChampion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CohortEntry_challengeId_userId_key" ON "CohortEntry"("challengeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyChampion_month_year_key" ON "MonthlyChampion"("month", "year");

-- AddForeignKey
ALTER TABLE "CohortEntry" ADD CONSTRAINT "CohortEntry_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "CohortChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CohortEntry" ADD CONSTRAINT "CohortEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyChampion" ADD CONSTRAINT "MonthlyChampion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
