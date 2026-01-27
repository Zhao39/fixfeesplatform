-- Add default CC settings at company level
ALTER TABLE "companySettings"
ADD COLUMN IF NOT EXISTS "defaultSupplierCc" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "defaultCustomerCc" TEXT[] DEFAULT '{}';

-- Add default CC at supplier level
ALTER TABLE "supplier"
ADD COLUMN IF NOT EXISTS "defaultCc" TEXT[] DEFAULT '{}';

-- Add default CC at customer level
ALTER TABLE "customer"
ADD COLUMN IF NOT EXISTS "defaultCc" TEXT[] DEFAULT '{}';
