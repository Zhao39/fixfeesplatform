-- Onboarding Fields for Company Table

CREATE TYPE "onboardingIndustry" AS ENUM (
  'robotics_oem',
  'cnc_aerospace',
  'metal_fabrication',
  'automotive_precision',
  'custom'
);

ALTER TABLE "company" DROP CONSTRAINT IF EXISTS "company_industryId_fkey";
ALTER TABLE "company" DROP COLUMN IF EXISTS "industryId";

ALTER TABLE "company"
  ADD COLUMN "industryId" "onboardingIndustry",
  ADD COLUMN IF NOT EXISTS "customIndustryDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "selectedModules" TEXT[],
  ADD COLUMN IF NOT EXISTS "featureRequests" TEXT,
  ADD COLUMN IF NOT EXISTS "seedDemoData" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS "company_industryId_idx" ON "company"("industryId");
