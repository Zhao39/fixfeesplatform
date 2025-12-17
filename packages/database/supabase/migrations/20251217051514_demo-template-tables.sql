-- =========================================
-- Demo Template Tables for Carbon Modules
-- =========================================
-- This migration creates template tables in the demo_templates schema
-- and adds demo tracking columns to live tables.

-- =========================================
-- 1) Add demo tracking columns to existing tables
-- =========================================

-- Items
ALTER TABLE "item" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "item" ADD COLUMN IF NOT EXISTS "demoTemplateSetId" TEXT REFERENCES "templateSet"("id") ON DELETE SET NULL;
ALTER TABLE "item" ADD COLUMN IF NOT EXISTS "demoTemplateRowId" TEXT;
ALTER TABLE "item" ADD COLUMN IF NOT EXISTS "demoTouchedAt" TIMESTAMP WITH TIME ZONE;

DROP TRIGGER IF EXISTS "item_mark_demo_touched" ON "item";
CREATE TRIGGER "item_mark_demo_touched"
BEFORE UPDATE ON "item"
FOR EACH ROW EXECUTE FUNCTION mark_demo_touched();

-- Parts
ALTER TABLE "part" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "part" ADD COLUMN IF NOT EXISTS "demoTemplateSetId" TEXT REFERENCES "templateSet"("id") ON DELETE SET NULL;
ALTER TABLE "part" ADD COLUMN IF NOT EXISTS "demoTemplateRowId" TEXT;
ALTER TABLE "part" ADD COLUMN IF NOT EXISTS "demoTouchedAt" TIMESTAMP WITH TIME ZONE;

DROP TRIGGER IF EXISTS "part_mark_demo_touched" ON "part";
CREATE TRIGGER "part_mark_demo_touched"
BEFORE UPDATE ON "part"
FOR EACH ROW EXECUTE FUNCTION mark_demo_touched();

-- Quotes
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "demoTemplateSetId" TEXT REFERENCES "templateSet"("id") ON DELETE SET NULL;
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "demoTemplateRowId" TEXT;
ALTER TABLE "quote" ADD COLUMN IF NOT EXISTS "demoTouchedAt" TIMESTAMP WITH TIME ZONE;

DROP TRIGGER IF EXISTS "quote_mark_demo_touched" ON "quote";
CREATE TRIGGER "quote_mark_demo_touched"
BEFORE UPDATE ON "quote"
FOR EACH ROW EXECUTE FUNCTION mark_demo_touched();

-- Quote Lines
ALTER TABLE "quoteLine" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "quoteLine" ADD COLUMN IF NOT EXISTS "demoTemplateSetId" TEXT REFERENCES "templateSet"("id") ON DELETE SET NULL;
ALTER TABLE "quoteLine" ADD COLUMN IF NOT EXISTS "demoTemplateRowId" TEXT;
ALTER TABLE "quoteLine" ADD COLUMN IF NOT EXISTS "demoTouchedAt" TIMESTAMP WITH TIME ZONE;

DROP TRIGGER IF EXISTS "quoteLine_mark_demo_touched" ON "quoteLine";
CREATE TRIGGER "quoteLine_mark_demo_touched"
BEFORE UPDATE ON "quoteLine"
FOR EACH ROW EXECUTE FUNCTION mark_demo_touched();

-- Purchase Orders
ALTER TABLE "purchaseOrder" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "purchaseOrder" ADD COLUMN IF NOT EXISTS "demoTemplateSetId" TEXT REFERENCES "templateSet"("id") ON DELETE SET NULL;
ALTER TABLE "purchaseOrder" ADD COLUMN IF NOT EXISTS "demoTemplateRowId" TEXT;
ALTER TABLE "purchaseOrder" ADD COLUMN IF NOT EXISTS "demoTouchedAt" TIMESTAMP WITH TIME ZONE;

DROP TRIGGER IF EXISTS "purchaseOrder_mark_demo_touched" ON "purchaseOrder";
CREATE TRIGGER "purchaseOrder_mark_demo_touched"
BEFORE UPDATE ON "purchaseOrder"
FOR EACH ROW EXECUTE FUNCTION mark_demo_touched();

-- Purchase Order Lines
ALTER TABLE "purchaseOrderLine" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "purchaseOrderLine" ADD COLUMN IF NOT EXISTS "demoTemplateSetId" TEXT REFERENCES "templateSet"("id") ON DELETE SET NULL;
ALTER TABLE "purchaseOrderLine" ADD COLUMN IF NOT EXISTS "demoTemplateRowId" TEXT;
ALTER TABLE "purchaseOrderLine" ADD COLUMN IF NOT EXISTS "demoTouchedAt" TIMESTAMP WITH TIME ZONE;

DROP TRIGGER IF EXISTS "purchaseOrderLine_mark_demo_touched" ON "purchaseOrderLine";
CREATE TRIGGER "purchaseOrderLine_mark_demo_touched"
BEFORE UPDATE ON "purchaseOrderLine"
FOR EACH ROW EXECUTE FUNCTION mark_demo_touched();

-- Customers
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "demoTemplateSetId" TEXT REFERENCES "templateSet"("id") ON DELETE SET NULL;
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "demoTemplateRowId" TEXT;
ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "demoTouchedAt" TIMESTAMP WITH TIME ZONE;

DROP TRIGGER IF EXISTS "customer_mark_demo_touched" ON "customer";
CREATE TRIGGER "customer_mark_demo_touched"
BEFORE UPDATE ON "customer"
FOR EACH ROW EXECUTE FUNCTION mark_demo_touched();

-- Suppliers
ALTER TABLE "supplier" ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "supplier" ADD COLUMN IF NOT EXISTS "demoTemplateSetId" TEXT REFERENCES "templateSet"("id") ON DELETE SET NULL;
ALTER TABLE "supplier" ADD COLUMN IF NOT EXISTS "demoTemplateRowId" TEXT;
ALTER TABLE "supplier" ADD COLUMN IF NOT EXISTS "demoTouchedAt" TIMESTAMP WITH TIME ZONE;

DROP TRIGGER IF EXISTS "supplier_mark_demo_touched" ON "supplier";
CREATE TRIGGER "supplier_mark_demo_touched"
BEFORE UPDATE ON "supplier"
FOR EACH ROW EXECUTE FUNCTION mark_demo_touched();

-- =========================================
-- 2) Create template tables in demo_templates schema
-- =========================================

-- Items template
CREATE TABLE IF NOT EXISTS demo_templates.item (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Core item fields (matching live table structure)
  "readableId"            TEXT NOT NULL,
  "name"                  TEXT NOT NULL,
  "description"           TEXT,
  "type"                  TEXT NOT NULL, -- will be cast to enum during seeding
  "itemTrackingType"      TEXT NOT NULL, -- will be cast to enum during seeding
  "replenishmentSystem"   TEXT NOT NULL, -- will be cast to enum during seeding
  "unitOfMeasureCode"     TEXT,
  "revision"              TEXT,
  "active"                BOOLEAN NOT NULL DEFAULT TRUE,

  PRIMARY KEY("templateSetId", "templateRowId")
);

-- Parts template
CREATE TABLE IF NOT EXISTS demo_templates.part (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Part fields
  "approved"              BOOLEAN NOT NULL DEFAULT FALSE,
  "fromDate"              DATE,
  "toDate"                DATE,

  PRIMARY KEY("templateSetId", "templateRowId")
);

-- Customers template
CREATE TABLE IF NOT EXISTS demo_templates.customer (
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
CREATE TABLE IF NOT EXISTS demo_templates.supplier (
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
CREATE TABLE IF NOT EXISTS demo_templates.quote (
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
    REFERENCES demo_templates.customer("templateSetId", "templateRowId")
);

-- Quote Lines template
CREATE TABLE IF NOT EXISTS demo_templates.quoteLine (
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
    REFERENCES demo_templates.quote("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplItemId")
    REFERENCES demo_templates.item("templateSetId", "templateRowId")
);

-- Purchase Orders template
CREATE TABLE IF NOT EXISTS demo_templates.purchaseOrder (
  "templateSetId"         TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,
  "templateRowId"         TEXT NOT NULL,

  -- Purchase order fields
  "purchaseOrderId"       TEXT NOT NULL,
  "tplSupplierId"         TEXT NOT NULL, -- references supplier templateRowId
  "status"                TEXT NOT NULL, -- will be cast to enum during seeding
  "orderDate"             DATE NOT NULL,
  "receiptPromisedDate"   DATE,
  "receiptRequestedDate"  DATE,

  PRIMARY KEY("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplSupplierId")
    REFERENCES demo_templates.supplier("templateSetId", "templateRowId")
);

-- Purchase Order Lines template
CREATE TABLE IF NOT EXISTS demo_templates.purchaseOrderLine (
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
    REFERENCES demo_templates.purchaseOrder("templateSetId", "templateRowId"),
  FOREIGN KEY ("templateSetId", "tplItemId")
    REFERENCES demo_templates.item("templateSetId", "templateRowId")
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA demo_templates TO service_role;
