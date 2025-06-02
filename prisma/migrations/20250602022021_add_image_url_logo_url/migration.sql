-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "logo_url" TEXT;
