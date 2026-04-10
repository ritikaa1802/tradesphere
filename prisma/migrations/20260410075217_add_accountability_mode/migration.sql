/*
  Warnings:

  - You are about to drop the column `status` on the `AccountabilityPair` table. All the data in the column will be lost.
  - You are about to drop the column `userAId` on the `AccountabilityPair` table. All the data in the column will be lost.
  - You are about to drop the column `userBId` on the `AccountabilityPair` table. All the data in the column will be lost.
  - You are about to drop the `AccountabilitySettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PartnerReview` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[weekStart,user1Id,user2Id]` on the table `AccountabilityPair` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user1Id` to the `AccountabilityPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2Id` to the `AccountabilityPair` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weekEnd` to the `AccountabilityPair` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AccountabilityPair" DROP CONSTRAINT "AccountabilityPair_userAId_fkey";

-- DropForeignKey
ALTER TABLE "AccountabilityPair" DROP CONSTRAINT "AccountabilityPair_userBId_fkey";

-- DropForeignKey
ALTER TABLE "AccountabilitySettings" DROP CONSTRAINT "AccountabilitySettings_userId_fkey";

-- DropForeignKey
ALTER TABLE "PartnerReview" DROP CONSTRAINT "PartnerReview_pairId_fkey";

-- DropForeignKey
ALTER TABLE "PartnerReview" DROP CONSTRAINT "PartnerReview_reviewedUserId_fkey";

-- DropForeignKey
ALTER TABLE "PartnerReview" DROP CONSTRAINT "PartnerReview_reviewerId_fkey";

-- DropIndex
DROP INDEX "AccountabilityPair_weekStart_userAId_userBId_key";

-- AlterTable
ALTER TABLE "AccountabilityPair" DROP COLUMN "status",
DROP COLUMN "userAId",
DROP COLUMN "userBId",
ADD COLUMN     "user1Id" TEXT NOT NULL,
ADD COLUMN     "user1ReviewDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "user2Id" TEXT NOT NULL,
ADD COLUMN     "user2ReviewDone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weekEnd" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountabilityMode" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "AccountabilitySettings";

-- DropTable
DROP TABLE "PartnerReview";

-- CreateTable
CREATE TABLE "AccountabilityReview" (
    "id" TEXT NOT NULL,
    "pairId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "doneWell" TEXT NOT NULL,
    "mistakes" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountabilityReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountabilityReview_pairId_reviewerId_key" ON "AccountabilityReview"("pairId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountabilityPair_weekStart_user1Id_user2Id_key" ON "AccountabilityPair"("weekStart", "user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "AccountabilityPair" ADD CONSTRAINT "AccountabilityPair_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityPair" ADD CONSTRAINT "AccountabilityPair_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityReview" ADD CONSTRAINT "AccountabilityReview_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES "AccountabilityPair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityReview" ADD CONSTRAINT "AccountabilityReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityReview" ADD CONSTRAINT "AccountabilityReview_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
