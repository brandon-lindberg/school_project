-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'APPLICATION_STATUS_UPDATED';

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';
