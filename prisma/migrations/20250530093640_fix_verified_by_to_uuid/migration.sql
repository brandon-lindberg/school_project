-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';

-- AlterTable
ALTER TABLE "School" ALTER COLUMN "verified_by" SET DATA TYPE TEXT;
