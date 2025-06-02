-- AlterTable
ALTER TABLE "AvailabilitySlot" ALTER COLUMN "date" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';
