-- DropForeignKey
ALTER TABLE "BlockedCountry" DROP CONSTRAINT "BlockedCountry_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "BrowsingHistory" DROP CONSTRAINT "BrowsingHistory_school_id_fkey";

-- DropForeignKey
ALTER TABLE "FeaturedSlot" DROP CONSTRAINT "FeaturedSlot_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "JobPosting" DROP CONSTRAINT "JobPosting_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "SchoolAdmin" DROP CONSTRAINT "SchoolAdmin_school_id_fkey";

-- DropForeignKey
ALTER TABLE "SchoolClaim" DROP CONSTRAINT "SchoolClaim_school_id_fkey";

-- DropForeignKey
ALTER TABLE "UserListSchools" DROP CONSTRAINT "UserListSchools_school_id_fkey";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';

-- AddForeignKey
ALTER TABLE "UserListSchools" ADD CONSTRAINT "UserListSchools_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrowsingHistory" ADD CONSTRAINT "BrowsingHistory_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClaim" ADD CONSTRAINT "SchoolClaim_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedCountry" ADD CONSTRAINT "BlockedCountry_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("school_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedSlot" ADD CONSTRAINT "FeaturedSlot_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("school_id") ON DELETE CASCADE ON UPDATE CASCADE;
