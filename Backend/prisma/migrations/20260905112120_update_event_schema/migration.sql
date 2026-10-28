/*
  Warnings:

  - Added the required column `name` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "date" DROP NOT NULL;

-- CreateTable
CREATE TABLE "EventItem" (
    "id" SERIAL NOT NULL,
    "photo" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "EventItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventItem" ADD CONSTRAINT "EventItem_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
