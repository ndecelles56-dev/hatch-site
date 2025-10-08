-- CreateEnum
CREATE TYPE "CommissionPlanType" AS ENUM ('FLAT', 'TIERED', 'CAP');

-- CreateEnum
CREATE TYPE "PlanAssigneeType" AS ENUM ('USER', 'TEAM');

-- CreateTable
CREATE TABLE "CommissionPlan" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CommissionPlanType" NOT NULL,
    "description" TEXT,
    "definition" JSONB NOT NULL,
    "postCapFee" JSONB,
    "bonusRules" JSONB,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommissionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanAssignment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "assigneeType" "PlanAssigneeType" NOT NULL,
    "assigneeId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CapLedger" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "capAmount" DECIMAL(12,2) NOT NULL,
    "companyDollarYtd" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "postCapFeesYtd" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lastDealId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CapLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanSnapshot" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "PlanSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommissionPlan_tenantId_isArchived_idx" ON "CommissionPlan"("tenantId", "isArchived");

-- CreateIndex
CREATE UNIQUE INDEX "CommissionPlan_tenantId_name_version_key" ON "CommissionPlan"("tenantId", "name", "version");

-- CreateIndex
CREATE INDEX "PlanAssignment_tenantId_assigneeType_assigneeId_effectiveFr_idx" ON "PlanAssignment"("tenantId", "assigneeType", "assigneeId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "PlanAssignment_tenantId_assigneeType_assigneeId_planId_effe_key" ON "PlanAssignment"("tenantId", "assigneeType", "assigneeId", "planId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "CapLedger_tenantId_userId_planId_periodStart_periodEnd_idx" ON "CapLedger"("tenantId", "userId", "planId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "CapLedger_tenantId_userId_planId_periodStart_key" ON "CapLedger"("tenantId", "userId", "planId", "periodStart");

-- CreateIndex
CREATE INDEX "PlanSnapshot_tenantId_planId_version_idx" ON "PlanSnapshot"("tenantId", "planId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "PlanSnapshot_planId_version_key" ON "PlanSnapshot"("planId", "version");

-- AddForeignKey
ALTER TABLE "CommissionPlan" ADD CONSTRAINT "CommissionPlan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommissionPlan" ADD CONSTRAINT "CommissionPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAssignment" ADD CONSTRAINT "PlanAssignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAssignment" ADD CONSTRAINT "PlanAssignment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CommissionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanAssignment" ADD CONSTRAINT "PlanAssignment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapLedger" ADD CONSTRAINT "CapLedger_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapLedger" ADD CONSTRAINT "CapLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CapLedger" ADD CONSTRAINT "CapLedger_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CommissionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanSnapshot" ADD CONSTRAINT "PlanSnapshot_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanSnapshot" ADD CONSTRAINT "PlanSnapshot_planId_fkey" FOREIGN KEY ("planId") REFERENCES "CommissionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanSnapshot" ADD CONSTRAINT "PlanSnapshot_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
