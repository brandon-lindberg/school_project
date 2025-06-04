/*
  Warnings:

  - You are about to drop the column `verification_data` on the `SchoolClaim` table. All the data in the column will be lost.
  - You are about to drop the column `verification_method` on the `SchoolClaim` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';

-- AlterTable
ALTER TABLE "SchoolClaim" DROP COLUMN "verification_data",
DROP COLUMN "verification_method",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone_number" TEXT;
