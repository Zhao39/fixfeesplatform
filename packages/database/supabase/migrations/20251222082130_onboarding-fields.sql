-- =========================================
-- Onboarding Fields for Company Table
-- =========================================
-- This migration adds fields to store onboarding selections:
-- - Industry selection (enum with "custom" option)
-- - Module selection
-- - Feature requests
-- - Demo data preference

-- Create enum type for industry selection
CREATE TYPE "onboardingIndustry" AS ENUM (
  'robotics_oem',
  'cnc_aerospace',
  'metal_fabrication',
  'automotive_precision',
  'custom'
);

-- Drop foreign key constraint if it exists (from previous migration that referenced industry table)
ALTER TABLE "company" DROP CONSTRAINT IF EXISTS "company_industryId_fkey";

-- Drop the column if it exists (to recreate with correct type)
ALTER TABLE "company" DROP COLUMN IF EXISTS "industryId";

ALTER TABLE "company"
  ADD COLUMN "industryId" "onboardingIndustry",
  ADD COLUMN IF NOT EXISTS "customIndustryDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "selectedModules" TEXT[],
  ADD COLUMN IF NOT EXISTS "featureRequests" TEXT,
  ADD COLUMN IF NOT EXISTS "seedDemoData" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS "company_industryId_idx" ON "company"("industryId");

COMMENT ON COLUMN "company"."industryId" IS 'Selected industry type during onboarding (enum with custom option)';
COMMENT ON COLUMN "company"."customIndustryDescription" IS 'Custom industry description if "custom" was selected';
COMMENT ON COLUMN "company"."selectedModules" IS 'Array of module IDs selected during onboarding';
COMMENT ON COLUMN "company"."featureRequests" IS 'Feature requests or needs submitted during onboarding';
COMMENT ON COLUMN "company"."seedDemoData" IS 'Whether user requested demo data to be seeded';
