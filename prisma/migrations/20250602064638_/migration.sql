-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "job_postings_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "job_postings_end" TIMESTAMP(3),
ADD COLUMN     "job_postings_start" TIMESTAMP(3);
