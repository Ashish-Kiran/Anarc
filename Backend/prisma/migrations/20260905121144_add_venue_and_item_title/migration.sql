/*
  Warnings:

  - Added the required column `title` to the `EventItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "venue" TEXT;

-- AlterTable
ALTER TABLE "EventItem" ADD COLUMN     "title" TEXT NOT NULL;
