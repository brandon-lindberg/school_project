-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';

-- CreateTable
CREATE TABLE "FeaturedSlot" (
    "id" SERIAL NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeaturedSlot_slotNumber_idx" ON "FeaturedSlot"("slotNumber");

-- AddForeignKey
ALTER TABLE "FeaturedSlot" ADD CONSTRAINT "FeaturedSlot_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
