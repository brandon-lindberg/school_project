-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "url" TEXT;
