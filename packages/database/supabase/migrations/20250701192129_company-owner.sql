-- Add ownerId column to company table to track the user who owns the company
ALTER TABLE "company" 
ADD COLUMN "ownerId" TEXT REFERENCES "user"("id");

-- Create index for performance
CREATE INDEX "idx_company_ownerId" ON "company" ("ownerId");

-- Add comment for documentation
COMMENT ON COLUMN "company"."ownerId" IS 'The user who owns and manages this company account';