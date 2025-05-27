-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "rating" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';
