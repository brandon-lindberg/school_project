-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "jlpt" TEXT NOT NULL DEFAULT 'None';

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';
