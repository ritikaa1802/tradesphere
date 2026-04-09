-- CreateTable
CREATE TABLE "AccountabilitySettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountabilitySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklySummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "tradeCount" INTEGER NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ruleBreaks" INTEGER NOT NULL DEFAULT 0,
    "emotionDistribution" JSONB NOT NULL,
    "avgRiskPerTrade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checklistCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "disciplineScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountabilityPair" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountabilityPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerReview" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewedUserId" TEXT NOT NULL,
    "goodPoints" TEXT NOT NULL,
    "mistakes" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountabilitySettings_userId_key" ON "AccountabilitySettings"("userId");

-- CreateIndex
CREATE INDEX "WeeklySummary_weekStart_idx" ON "WeeklySummary"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklySummary_userId_weekStart_key" ON "WeeklySummary"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "AccountabilityPair_weekStart_idx" ON "AccountabilityPair"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "AccountabilityPair_weekStart_userAId_userBId_key" ON "AccountabilityPair"("weekStart", "userAId", "userBId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerReview_pairId_reviewerId_key" ON "PartnerReview"("pairId", "reviewerId");

-- AddForeignKey
ALTER TABLE "AccountabilitySettings" ADD CONSTRAINT "AccountabilitySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklySummary" ADD CONSTRAINT "WeeklySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityPair" ADD CONSTRAINT "AccountabilityPair_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityPair" ADD CONSTRAINT "AccountabilityPair_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerReview" ADD CONSTRAINT "PartnerReview_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "AccountabilityPair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerReview" ADD CONSTRAINT "PartnerReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerReview" ADD CONSTRAINT "PartnerReview_reviewedUserId_fkey" FOREIGN KEY ("reviewedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
