-- AlterEnum
ALTER TYPE "ApplicationStage" ADD VALUE 'INTERVIEW_INVITATION_SENT';

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';
