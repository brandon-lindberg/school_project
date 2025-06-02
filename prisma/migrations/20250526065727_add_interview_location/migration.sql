-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "interviewLocation" TEXT;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';
