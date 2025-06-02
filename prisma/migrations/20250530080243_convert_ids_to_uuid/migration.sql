/*
  Warnings:

  - The primary key for the `MessageRecipient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `School` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SchoolAdmin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserListSchools` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_userId_fkey";

-- DropForeignKey
ALTER TABLE "ApplicationMessage" DROP CONSTRAINT "ApplicationMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "AvailabilitySlot" DROP CONSTRAINT "AvailabilitySlot_userId_fkey";

-- DropForeignKey
ALTER TABLE "BlockedCountry" DROP CONSTRAINT "BlockedCountry_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "BrowsingHistory" DROP CONSTRAINT "BrowsingHistory_school_id_fkey";

-- DropForeignKey
ALTER TABLE "BrowsingHistory" DROP CONSTRAINT "BrowsingHistory_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CandidateNote" DROP CONSTRAINT "CandidateNote_authorId_fkey";

-- DropForeignKey
ALTER TABLE "FeaturedSlot" DROP CONSTRAINT "FeaturedSlot_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_interviewerId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewFeedback" DROP CONSTRAINT "InterviewFeedback_authorId_fkey";

-- DropForeignKey
ALTER TABLE "JobPosting" DROP CONSTRAINT "JobPosting_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "MessageRecipient" DROP CONSTRAINT "MessageRecipient_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_user_id_fkey";

-- DropForeignKey
ALTER TABLE "SchoolAdmin" DROP CONSTRAINT "SchoolAdmin_assigned_by_fkey";

-- DropForeignKey
ALTER TABLE "SchoolAdmin" DROP CONSTRAINT "SchoolAdmin_school_id_fkey";

-- DropForeignKey
ALTER TABLE "SchoolAdmin" DROP CONSTRAINT "SchoolAdmin_user_id_fkey";

-- DropForeignKey
ALTER TABLE "SchoolClaim" DROP CONSTRAINT "SchoolClaim_processed_by_fkey";

-- DropForeignKey
ALTER TABLE "SchoolClaim" DROP CONSTRAINT "SchoolClaim_school_id_fkey";

-- DropForeignKey
ALTER TABLE "SchoolClaim" DROP CONSTRAINT "SchoolClaim_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserList" DROP CONSTRAINT "UserList_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserListSchools" DROP CONSTRAINT "UserListSchools_school_id_fkey";

-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ApplicationMessage" ALTER COLUMN "senderId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "AvailabilitySlot" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "BlockedCountry" ALTER COLUMN "schoolId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "BrowsingHistory" ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "school_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "CandidateNote" ALTER COLUMN "authorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "FeaturedSlot" ALTER COLUMN "schoolId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Interview" ALTER COLUMN "interviewerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "InterviewFeedback" ALTER COLUMN "authorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "JobPosting" ALTER COLUMN "schoolId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "JournalEntry" ALTER COLUMN "authorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "sender_id" SET DATA TYPE TEXT,
ALTER COLUMN "scheduled_deletion" SET DEFAULT NOW() + INTERVAL '30 days';

-- AlterTable
ALTER TABLE "MessageRecipient" DROP CONSTRAINT "MessageRecipient_pkey",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "MessageRecipient_pkey" PRIMARY KEY ("message_id", "user_id");

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "School" DROP CONSTRAINT "School_pkey",
ALTER COLUMN "school_id" DROP DEFAULT,
ALTER COLUMN "school_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "School_pkey" PRIMARY KEY ("school_id");
DROP SEQUENCE "School_school_id_seq";

-- AlterTable
ALTER TABLE "SchoolAdmin" DROP CONSTRAINT "SchoolAdmin_pkey",
ALTER COLUMN "school_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "assigned_by" SET DATA TYPE TEXT,
ADD CONSTRAINT "SchoolAdmin_pkey" PRIMARY KEY ("school_id", "user_id");

-- AlterTable
ALTER TABLE "SchoolClaim" ALTER COLUMN "school_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "processed_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "user_id" DROP DEFAULT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("user_id");
DROP SEQUENCE "User_user_id_seq";

-- AlterTable
ALTER TABLE "UserList" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "UserListSchools" DROP CONSTRAINT "UserListSchools_pkey",
ALTER COLUMN "school_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserListSchools_pkey" PRIMARY KEY ("list_id", "school_id");

-- AddForeignKey
ALTER TABLE "UserList" ADD CONSTRAINT "UserList_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserListSchools" ADD CONSTRAINT "UserListSchools_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrowsingHistory" ADD CONSTRAINT "BrowsingHistory_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrowsingHistory" ADD CONSTRAINT "BrowsingHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClaim" ADD CONSTRAINT "SchoolClaim_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClaim" ADD CONSTRAINT "SchoolClaim_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClaim" ADD CONSTRAINT "SchoolClaim_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRecipient" ADD CONSTRAINT "MessageRecipient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedCountry" ADD CONSTRAINT "BlockedCountry_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationMessage" ADD CONSTRAINT "ApplicationMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedSlot" ADD CONSTRAINT "FeaturedSlot_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;
