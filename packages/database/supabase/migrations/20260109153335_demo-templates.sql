-- Demo Templates Infrastructure

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

CREATE TABLE IF NOT EXISTS "templateSet" (
  "id"            TEXT PRIMARY KEY DEFAULT xid(),
  "industryId"    TEXT NOT NULL REFERENCES "industry"("id") ON DELETE CASCADE,
  "moduleId"      TEXT NOT NULL REFERENCES "demoModule"("id") ON DELETE CASCADE,
  "version"       INTEGER NOT NULL DEFAULT 1,
  "key"           TEXT NOT NULL,
  "name"          TEXT NOT NULL,
  "description"   TEXT,
  "isSystem"      BOOLEAN NOT NULL DEFAULT TRUE,
  "createdBy"     TEXT,
  "createdAt"     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "templateSet_key_uk" UNIQUE("key"),
  CONSTRAINT "templateSet_industry_module_version_uk" UNIQUE("industryId", "moduleId", "version")
);

CREATE TABLE IF NOT EXISTS "demoSeedRun" (
  "id"              TEXT PRIMARY KEY DEFAULT xid(),
  "companyId"       TEXT NOT NULL REFERENCES "company"("id") ON DELETE CASCADE,
  "requestedBy"     TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "industryId"      TEXT NOT NULL REFERENCES "industry"("id") ON DELETE CASCADE,
  "requestedModules" TEXT[] NOT NULL,
  "status"          TEXT NOT NULL DEFAULT 'queued' CHECK ("status" IN ('queued','running','done','failed')),
  "startedAt"       TIMESTAMP WITH TIME ZONE,
  "finishedAt"      TIMESTAMP WITH TIME ZONE,
  "error"           TEXT,
  "createdAt"       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed industries and modules
INSERT INTO "industry" ("id", "name", "description") VALUES
  ('robotics_oem', 'Robotics OEM', 'Original Equipment Manufacturer building robots and automation systems'),
  ('cnc_aerospace', 'CNC Manufacturing', 'CNC machine shop fabricating precision metal and composite parts'),
  ('metal_fabrication', 'Sheet Metal Fabrication', 'Fabrication shop crafting sheet metal components and assemblies'),
  ('automotive_precision', 'Motor Assembly', 'Manufacturer producing precision motor assemblies and components')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "demoModule" ("id", "name", "description") VALUES
  ('Sales', 'Sales', 'Quotes, orders, and customer management'),
  ('Purchasing', 'Purchasing', 'Purchase orders and supplier management'),
  ('Parts', 'Parts', 'Parts and bill of materials'),
  ('Inventory', 'Inventory', 'Inventory tracking and management')
ON CONFLICT ("id") DO NOTHING;

-- Add demo tracking columns
ALTER TABLE "item" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "part" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "material" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "quoteLine" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "purchaseOrder" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "purchaseOrderLine" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "supplier" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "opportunity" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "salesRfq" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "salesRfqLine" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "supplierInteraction" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;

-- Add demo tracking columns for manufacturing tables
ALTER TABLE "makeMethod" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "methodMaterial" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "methodOperation" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "workCenter" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "process" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "workCenterProcess" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "quoteMakeMethod" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "quoteMaterial" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;
ALTER TABLE "quoteOperation" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;

-- Template schema
CREATE SCHEMA IF NOT EXISTS demo_templates;
REVOKE ALL ON SCHEMA demo_templates FROM PUBLIC;
GRANT USAGE ON SCHEMA demo_templates TO service_role;

CREATE TABLE IF NOT EXISTS demo_templates."item" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "readableId"            TEXT NOT NULL,
  "name"                  TEXT NOT NULL,
  "description"           TEXT,
  "type"                  "itemType" NOT NULL,
  "itemTrackingType"      "itemTrackingType" NOT NULL,
  "replenishmentSystem"   "itemReplenishmentSystem" NOT NULL,
  "unitOfMeasureCode"     TEXT NOT NULL,
  "revision"              TEXT,
  "active"                BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."part" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "approved"              BOOLEAN NOT NULL DEFAULT FALSE,
  "fromDate"              DATE,
  "toDate"                DATE,
  PRIMARY KEY("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."material" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "materialFormName"      TEXT NOT NULL,
  "materialSubstanceName" TEXT NOT NULL,
  "approved"              BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."customer" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "name"                  TEXT NOT NULL,
  "customerTypeId"        TEXT,
  "customerStatusId"      TEXT,
  "taxId"                 TEXT,
  "accountManagerId"      TEXT,
  PRIMARY KEY("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."supplier" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "name"                  TEXT NOT NULL,
  "supplierTypeId"        TEXT,
  "supplierStatusId"      TEXT,
  "taxId"                 TEXT,
  "accountManagerId"      TEXT,
  PRIMARY KEY("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."quote" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "quoteId"               TEXT NOT NULL,
  "tplCustomerId"         TEXT NOT NULL,
  "status"                TEXT NOT NULL,
  "expirationDate"        DATE,
  "customerReference"     TEXT,
  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplCustomerId") REFERENCES demo_templates."customer"("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."quoteLine" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "tplQuoteId"            TEXT NOT NULL,
  "tplItemId"             TEXT NOT NULL,
  "description"           TEXT,
  "quantity"              NUMERIC NOT NULL CHECK ("quantity" > 0),
  "unitPrice"             NUMERIC NOT NULL DEFAULT 0,
  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplQuoteId") REFERENCES demo_templates."quote"("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplItemId") REFERENCES demo_templates."item"("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."purchaseOrder" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "purchaseOrderId"       TEXT NOT NULL,
  "tplSupplierId"         TEXT NOT NULL,
  "purchaseOrderType"     TEXT NOT NULL,
  "status"                TEXT NOT NULL,
  "orderDate"             DATE NOT NULL,
  "receiptPromisedDate"   DATE,
  "receiptRequestedDate"  DATE,
  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplSupplierId") REFERENCES demo_templates."supplier"("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."purchaseOrderLine" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "tplPurchaseOrderId"    TEXT NOT NULL,
  "tplItemId"             TEXT NOT NULL,
  "description"           TEXT,
  "quantity"              NUMERIC NOT NULL CHECK ("quantity" > 0),
  "unitPrice"             NUMERIC NOT NULL DEFAULT 0,
  "receiptPromisedDate"   DATE,
  "receiptRequestedDate"  DATE,
  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplPurchaseOrderId") REFERENCES demo_templates."purchaseOrder"("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplItemId") REFERENCES demo_templates."item"("templateSetId", "templateRowId")
);

-- Manufacturing template tables

CREATE TABLE IF NOT EXISTS demo_templates."workCenter" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "name"                  TEXT NOT NULL,
  "description"           TEXT,
  "machineRate"           NUMERIC NOT NULL DEFAULT 0,
  "overheadRate"          NUMERIC NOT NULL DEFAULT 0,
  "laborRate"             NUMERIC NOT NULL DEFAULT 0,
  "defaultStandardFactor" TEXT NOT NULL DEFAULT 'Minutes/Piece',
  PRIMARY KEY("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."process" (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,
  "name"                  TEXT NOT NULL,
  "defaultStandardFactor" TEXT NOT NULL DEFAULT 'Minutes/Piece',
  PRIMARY KEY("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."workCenterProcess" (
  "templateSetId"    TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "tplWorkCenterId"  TEXT NOT NULL,
  "tplProcessId"     TEXT NOT NULL,
  PRIMARY KEY("templateSetId", "tplWorkCenterId", "tplProcessId"),
  FOREIGN KEY ("templateSetId", "tplWorkCenterId") REFERENCES demo_templates."workCenter"("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplProcessId") REFERENCES demo_templates."process"("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."makeMethod" (
  "templateSetId"    TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"    TEXT NOT NULL,
  "tplItemId"        TEXT NOT NULL,
  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplItemId") REFERENCES demo_templates."item"("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."methodMaterial" (
  "templateSetId"           TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"           TEXT NOT NULL,
  "tplMakeMethodId"         TEXT NOT NULL,
  "tplItemId"               TEXT NOT NULL,
  "methodType"              TEXT NOT NULL DEFAULT 'Buy',
  "tplMaterialMakeMethodId" TEXT,
  "quantity"                NUMERIC NOT NULL,
  "unitOfMeasureCode"       TEXT NOT NULL DEFAULT 'EA',
  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplMakeMethodId") REFERENCES demo_templates."makeMethod"("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplItemId") REFERENCES demo_templates."item"("templateSetId", "templateRowId")
);

CREATE TABLE IF NOT EXISTS demo_templates."methodOperation" (
  "templateSetId"      TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"      TEXT NOT NULL,
  "tplMakeMethodId"    TEXT NOT NULL,
  "tplProcessId"       TEXT NOT NULL,
  "tplWorkCenterId"    TEXT,
  "order"              DOUBLE PRECISION NOT NULL DEFAULT 1,
  "operationOrder"     TEXT NOT NULL DEFAULT 'After Previous',
  "description"        TEXT,
  "setupTime"          NUMERIC NOT NULL DEFAULT 0,
  "setupUnit"          TEXT NOT NULL DEFAULT 'Total Hours',
  "laborTime"          NUMERIC NOT NULL DEFAULT 0,
  "laborUnit"          TEXT NOT NULL DEFAULT 'Hours/Piece',
  "machineTime"        NUMERIC NOT NULL DEFAULT 0,
  "machineUnit"        TEXT NOT NULL DEFAULT 'Hours/Piece',
  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplMakeMethodId") REFERENCES demo_templates."makeMethod"("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplProcessId") REFERENCES demo_templates."process"("templateSetId", "templateRowId")
);

GRANT ALL ON ALL TABLES IN SCHEMA demo_templates TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA demo_templates TO service_role;
