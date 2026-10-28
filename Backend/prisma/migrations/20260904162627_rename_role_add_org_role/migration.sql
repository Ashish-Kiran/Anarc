/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `InviteToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SiteRole" AS ENUM ('MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "InviteToken" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "orgRole" TEXT,
ADD COLUMN     "siteRole" "SiteRole" NOT NULL DEFAULT 'MEMBER';

-- DropEnum
DROP TYPE "Role";
