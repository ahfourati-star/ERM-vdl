-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "process" TEXT,
    "status" "RiskStatus" NOT NULL DEFAULT 'OPEN',
    "inherentProbability" INTEGER NOT NULL,
    "inherentImpact" INTEGER NOT NULL,
    "residualProbability" INTEGER NOT NULL,
    "residualImpact" INTEGER NOT NULL,
    "targetProbability" INTEGER NOT NULL,
    "targetImpact" INTEGER NOT NULL,
    "exposureAmount" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgId" TEXT NOT NULL,
    "ownerMembershipId" TEXT,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Risk_orgId_idx" ON "Risk"("orgId");

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_ownerMembershipId_fkey" FOREIGN KEY ("ownerMembershipId") REFERENCES "Membership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
