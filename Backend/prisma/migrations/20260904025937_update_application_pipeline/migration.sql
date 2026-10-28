-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApplicationStatus" ADD VALUE 'EXAM_PASSED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'EXAM_FAILED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW_SCHEDULED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW_PASSED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'INTERVIEW_FAILED';
ALTER TYPE "ApplicationStatus" ADD VALUE 'CONVERTED';

-- AlterTable
ALTER TABLE "AdmitCard" ADD COLUMN     "examScore" DOUBLE PRECISION,
ADD COLUMN     "isPassed" BOOLEAN,
ADD COLUMN     "maxScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "InterviewInvite" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "interviewScore" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "isPassed" BOOLEAN,
    "feedback" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewInvite_applicationId_key" ON "InterviewInvite"("applicationId");

-- AddForeignKey
ALTER TABLE "InterviewInvite" ADD CONSTRAINT "InterviewInvite_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
