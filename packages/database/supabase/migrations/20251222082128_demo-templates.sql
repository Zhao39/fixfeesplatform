
CREATE TABLE IF NOT EXISTS "industry" (
  "id"          TEXT PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "description" TEXT
);

CREATE TABLE IF NOT EXISTS "demoModule" (
  "id"          TEXT PRIMARY KEY,
  "name"        TEXT NOT NULL,
  "description" TEXT
);

-- =========================================
-- Template sets registry (system templates now; user templates later)
-- =========================================
CREATE TABLE IF NOT EXISTS "templateSet" (
  "id"            TEXT PRIMARY KEY DEFAULT xid(),
  "industryId"    TEXT NOT NULL REFERENCES "industry"("id") ON DELETE CASCADE,
  "moduleId"      TEXT NOT NULL REFERENCES "demoModule"("id") ON DELETE CASCADE,

  -- versioning lets you evolve templates without breaking existing tenants
  "version"       INTEGER NOT NULL DEFAULT 1,

  "key"           TEXT NOT NULL,             -- e.g. 'cnc.sales.v1'
  "name"          TEXT NOT NULL,
  "description"   TEXT,

  "isSystem"      BOOLEAN NOT NULL DEFAULT TRUE,  -- later: user templates flip this
  "createdBy"     TEXT,                           -- null for system templates

  "createdAt"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT "templateSet_key_uk" UNIQUE("key"),
  CONSTRAINT "templateSet_industry_module_version_uk" UNIQUE("industryId", "moduleId", "version")
);

-- =========================================
-- Demo seeding state + runs (for Trigger.dev visibility)
-- =========================================
CREATE TABLE IF NOT EXISTS "demoSeedState" (
  "companyId"       TEXT NOT NULL REFERENCES "company"("id") ON DELETE CASCADE,
  "moduleId"        TEXT NOT NULL REFERENCES "demoModule"("id") ON DELETE CASCADE,
  "templateSetId"   TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,

  "status"          TEXT NOT NULL DEFAULT 'pending'
                    CHECK ("status" IN ('pending','running','done','failed')),

  "seededBy"        TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "seededAt"        TIMESTAMP WITH TIME ZONE,
  "lastError"       TEXT,

  "createdAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  PRIMARY KEY("companyId", "moduleId")
);

CREATE TABLE IF NOT EXISTS "demoSeedRun" (
  "id"              TEXT PRIMARY KEY DEFAULT xid(),
  "companyId"       TEXT NOT NULL REFERENCES "company"("id") ON DELETE CASCADE,
  "requestedBy"     TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "industryId"      TEXT NOT NULL REFERENCES "industry"("id") ON DELETE CASCADE,

  "requestedModules" TEXT[] NOT NULL,               -- ['Accounting','Sales']
  "status"          TEXT NOT NULL DEFAULT 'queued'
                    CHECK ("status" IN ('queued','running','done','failed')),

  "startedAt"       TIMESTAMP WITH TIME ZONE,
  "finishedAt"      TIMESTAMP WITH TIME ZONE,
  "error"           TEXT,

  "createdAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


-- =========================================
-- Keep templates organized: separate schema
-- =========================================
CREATE SCHEMA IF NOT EXISTS demo_templates;

-- Lock down by default (optional; tune for Supabase/service role usage)
REVOKE ALL ON SCHEMA demo_templates FROM PUBLIC;
GRANT USAGE ON SCHEMA demo_templates TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA demo_templates TO service_role;

-- =========================================
-- Seed initial industries and modules
-- =========================================
INSERT INTO "industry" ("id", "name", "description") VALUES
  ('robotics_oem', 'Robotics OEM', 'Original Equipment Manufacturer building humanoid robots'),
  ('cnc_aerospace', 'CNC Aerospace', 'CNC machine shop fabricating metal and composite parts for aerospace'),
  ('metal_fabrication', 'Metal Fabrication', 'Fabrication shop crafting structural metal components and assemblies'),
  ('automotive_precision', 'Automotive Precision', 'Manufacturer producing precision parts and assemblies for high-performance vehicles')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "demoModule" ("id", "name", "description") VALUES
  ('Sales', 'Sales', 'Quotes, orders, and customer management'),
  ('Purchasing', 'Purchasing', 'Purchase orders and supplier management'),
  ('Parts', 'Parts', 'Parts and bill of materials'),
  ('Inventory', 'Inventory', 'Inventory tracking and management')
ON CONFLICT ("id") DO NOTHING;

-- =========================================
-- Add demo tracking column to existing tables
-- =========================================
-- Simple boolean flag to identify demo data rows

-- Items
ALTER TABLE "item" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;

-- Parts
ALTER TABLE "part" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN  DEFAULT FALSE;

-- Quotes
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN  DEFAULT FALSE;

-- Quote Lines
ALTER TABLE "quoteLine" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN  DEFAULT FALSE;

-- Purchase Orders
ALTER TABLE "purchaseOrder" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN  DEFAULT FALSE;

-- Purchase Order Lines
ALTER TABLE "purchaseOrderLine" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN  DEFAULT FALSE;

-- Customers
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN  DEFAULT FALSE;

-- Suppliers
ALTER TABLE "supplier" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN  DEFAULT FALSE;

-- Opportunities
ALTER TABLE "opportunity" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;

-- Sales RFQs
ALTER TABLE "salesRfq" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;

-- Sales RFQ Lines
ALTER TABLE "salesRfqLine" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;

-- Supplier Interactions
ALTER TABLE "supplierInteraction" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;

-- =========================================
-- Create template tables in demo_templates schema
-- =========================================

-- Items template
CREATE TABLE IF NOT EXISTS demo_templates."item" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Core item fields (matching live table structure)
  "readableId"            TEXT NOT NULL,
  "name"                  TEXT NOT NULL,
  "description"           TEXT,
  "type"                  "itemType" NOT NULL, -- will be cast to enum during seeding
  "itemTrackingType"      "itemTrackingType" NOT NULL, -- will be cast to enum during seeding
  "replenishmentSystem"   "itemReplenishmentSystem" NOT NULL, -- will be cast to enum during seeding
  "unitOfMeasureCode"     TEXT NOT NULL,
  "revision"              TEXT,
  "active"                BOOLEAN NOT NULL DEFAULT TRUE,

  PRIMARY KEY("templateSetId", "templateRowId")
);

-- Parts template
CREATE TABLE IF NOT EXISTS demo_templates."part" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Part fields
  "approved"              BOOLEAN NOT NULL DEFAULT FALSE,
  "fromDate"              DATE,
  "toDate"                DATE,

  PRIMARY KEY("templateSetId", "templateRowId")
);

-- Customers template
CREATE TABLE IF NOT EXISTS demo_templates."customer" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Customer fields
  "name"                  TEXT NOT NULL,
  "customerTypeId"        TEXT,
  "customerStatusId"      TEXT,
  "taxId"                 TEXT,
  "accountManagerId"      TEXT, -- will be mapped to a real user during seeding

  PRIMARY KEY("templateSetId", "templateRowId")
);

-- Suppliers template
CREATE TABLE IF NOT EXISTS demo_templates."supplier" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Supplier fields
  "name"                  TEXT NOT NULL,
  "supplierTypeId"        TEXT,
  "supplierStatusId"      TEXT,
  "taxId"                 TEXT,
  "accountManagerId"      TEXT, -- will be mapped to a real user during seeding

  PRIMARY KEY("templateSetId", "templateRowId")
);

-- Quotes template
CREATE TABLE IF NOT EXISTS demo_templates."quote" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Quote fields
  "quoteId"               TEXT NOT NULL,
  "tplCustomerId"         TEXT NOT NULL, -- references customer templateRowId
  "status"                TEXT NOT NULL, -- will be cast to enum during seeding
  "expirationDate"        DATE,
  "customerReference"     TEXT,

  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplCustomerId")
    REFERENCES demo_templates."customer"("templateSetId", "templateRowId")
);

-- Quote Lines template
CREATE TABLE IF NOT EXISTS demo_templates."quoteLine" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Quote line fields
  "tplQuoteId"            TEXT NOT NULL, -- references quote templateRowId
  "tplItemId"             TEXT NOT NULL, -- references item templateRowId
  "description"           TEXT,
  "quantity"              NUMERIC NOT NULL CHECK ("quantity" > 0),
  "unitPrice"             NUMERIC NOT NULL DEFAULT 0,

  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplQuoteId")
    REFERENCES demo_templates."quote"("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplItemId")
    REFERENCES demo_templates."item"("templateSetId", "templateRowId")
);

-- Purchase Orders template
CREATE TABLE IF NOT EXISTS demo_templates."purchaseOrder" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Purchase order fields
  "purchaseOrderId"       TEXT NOT NULL,
  "tplSupplierId"         TEXT NOT NULL, -- references supplier templateRowId
  "purchaseOrderType"     TEXT NOT NULL, -- will be cast to enum during seeding
  "status"                TEXT NOT NULL, -- will be cast to enum during seeding
  "orderDate"             DATE NOT NULL,
  "receiptPromisedDate"   DATE,
  "receiptRequestedDate"  DATE,

  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplSupplierId")
    REFERENCES demo_templates."supplier"("templateSetId", "templateRowId")
);

-- Purchase Order Lines template
CREATE TABLE IF NOT EXISTS demo_templates."purchaseOrderLine" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Purchase order line fields
  "tplPurchaseOrderId"    TEXT NOT NULL, -- references purchaseOrder templateRowId
  "tplItemId"             TEXT NOT NULL, -- references item templateRowId
  "description"           TEXT,
  "quantity"              NUMERIC NOT NULL CHECK ("quantity" > 0),
  "unitPrice"             NUMERIC NOT NULL DEFAULT 0,
  "receiptPromisedDate"   DATE,
  "receiptRequestedDate"  DATE,

  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplPurchaseOrderId")
    REFERENCES demo_templates."purchaseOrder"("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplItemId")
    REFERENCES demo_templates."item"("templateSetId", "templateRowId")
);

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA demo_templates TO service_role;

-- =========================================
-- Note: Demo seeding is handled by Kysely in TypeScript.
-- See: packages/database/src/seed/seed-demo-data.ts
-- =========================================
