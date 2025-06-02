/*
  Warnings:

  - The `status` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `currentStage` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SCREENING', 'IN_PROCESS', 'REJECTED', 'OFFER', 'OFFER_ACCEPTED', 'OFFER_REJECTED');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "status",
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
DROP COLUMN "currentStage",
ADD COLUMN     "currentStage" "ApplicationStage" NOT NULL DEFAULT 'SCREENING';

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';
