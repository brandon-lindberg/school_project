/*
  Warnings:

  - You are about to drop the column `full_name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "full_name",
ADD COLUMN     "family_name" TEXT,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "phone_number" TEXT;
