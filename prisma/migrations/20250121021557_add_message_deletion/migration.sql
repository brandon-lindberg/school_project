-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "scheduled_deletion" TIMESTAMP(3) NOT NULL DEFAULT NOW() + INTERVAL '30 days';

-- CreateIndex
CREATE INDEX "Message_scheduled_deletion_idx" ON "Message"("scheduled_deletion");
