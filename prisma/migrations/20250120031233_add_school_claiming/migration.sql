-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'SCHOOL_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verification_date" TIMESTAMP(3),
ADD COLUMN     "verified_by" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "SchoolClaim" (
    "claim_id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "verification_method" TEXT NOT NULL,
    "verification_data" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "processed_by" INTEGER,
    "notes" TEXT,

    CONSTRAINT "SchoolClaim_pkey" PRIMARY KEY ("claim_id")
);

-- CreateTable
CREATE TABLE "SchoolAdmin" (
    "school_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_by" INTEGER NOT NULL,

    CONSTRAINT "SchoolAdmin_pkey" PRIMARY KEY ("school_id","user_id")
);

-- CreateIndex
CREATE INDEX "SchoolClaim_school_id_idx" ON "SchoolClaim"("school_id");

-- CreateIndex
CREATE INDEX "SchoolClaim_user_id_idx" ON "SchoolClaim"("user_id");

-- CreateIndex
CREATE INDEX "SchoolClaim_status_idx" ON "SchoolClaim"("status");

-- CreateIndex
CREATE INDEX "SchoolAdmin_school_id_idx" ON "SchoolAdmin"("school_id");

-- CreateIndex
CREATE INDEX "SchoolAdmin_user_id_idx" ON "SchoolAdmin"("user_id");

-- AddForeignKey
ALTER TABLE "SchoolClaim" ADD CONSTRAINT "SchoolClaim_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClaim" ADD CONSTRAINT "SchoolClaim_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolClaim" ADD CONSTRAINT "SchoolClaim_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("school_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolAdmin" ADD CONSTRAINT "SchoolAdmin_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
