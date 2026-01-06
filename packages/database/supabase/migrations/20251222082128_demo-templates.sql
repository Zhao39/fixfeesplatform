-- =========================================
-- Demo Template Infrastructure
-- =========================================
-- This migration creates the infrastructure for industry-scoped demo templates
-- with modular seeding, deterministic UUID mapping, idempotent seeding,
-- demo row tracking, and "touched" protection.

-- =========================================
-- 1) Extensions
-- =========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- uuid_generate_v5()

-- =========================================
-- 2) Reference catalogs (industry + modules)
-- =========================================
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
-- 3) Template sets registry (system templates now; user templates later)
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
-- 4) Demo seeding state + runs (for Trigger.dev visibility)
-- =========================================
CREATE TABLE IF NOT EXISTS "demoSeedState" (
  "companyId"       TEXT NOT NULL REFERENCES "company"("id") ON DELETE CASCADE,
  "moduleId"        TEXT NOT NULL REFERENCES "demoModule"("id") ON DELETE CASCADE,
  "templateSetId"   TEXT NOT NULL REFERENCES "templateSet"("id") ON DELETE CASCADE,

  "status"          TEXT NOT NULL DEFAULT 'pending'
                    CHECK ("status" IN ('pending','running','done','failed')),

  "seededBy"        TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "seededAt"        TIMESTAMP WITH TIME ZONE,
  "lockedAt"        TIMESTAMP WITH TIME ZONE,  -- once "real usage" starts, lock destructive ops
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

-- Dashboard view for UI/admin
CREATE OR REPLACE VIEW "demoSeedDashboard" AS
SELECT
  s."companyId",
  s."moduleId",
  ts."key"         AS "templateKey",
  ts."version",
  s."status",
  s."seededAt",
  s."lockedAt",
  s."lastError"
FROM "demoSeedState" s
JOIN "templateSet" ts ON ts."id" = s."templateSetId";

-- =========================================
-- 5) Deterministic ID function (the whole FK magic)
-- =========================================
-- Uses a fixed namespace UUID and combines company_id + template_row_id as the name
-- This ensures deterministic UUIDs for demo data across companies
CREATE OR REPLACE FUNCTION demo_id(p_company_id TEXT, p_template_row_id TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  -- Fixed namespace UUID for demo data (generated once, never changes)
  -- This ensures deterministic UUIDs: same company_id + template_row_id = same UUID
  SELECT uuid_generate_v5(
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::uuid,  -- Fixed namespace for demo data
    (p_company_id || '::' || p_template_row_id)     -- Combined name: company_id::template_row_id
  )::TEXT;
$$;

-- =========================================
-- 6) Demo row "touched" protection (reusable trigger)
-- =========================================
-- Standard columns you add to ALL seeded/live tables:
-- isDemo boolean, demoTemplateSetId text, demoTemplateRowId text, demoTouchedAt timestamptz
CREATE OR REPLACE FUNCTION mark_demo_touched()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (NEW."isDemo" IS TRUE) AND (OLD."demoTouchedAt" IS NULL) THEN
    -- Any update marks it as "user touched" (protect from cleanup/overwrite)
    NEW."demoTouchedAt" := NOW();
  END IF;
  RETURN NEW;
END $$;

-- =========================================
-- 7) Keep templates organized: separate schema
-- =========================================
CREATE SCHEMA IF NOT EXISTS demo_templates;

-- Lock down by default (optional; tune for Supabase/service role usage)
REVOKE ALL ON SCHEMA demo_templates FROM PUBLIC;
GRANT USAGE ON SCHEMA demo_templates TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA demo_templates TO service_role;

-- =========================================
-- 8) Seed initial industries and modules
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
-- 9) Module seeding procedures (Trigger.dev calls these)
-- =========================================

-- Seed one module (router)
CREATE OR REPLACE PROCEDURE seed_demo_module(
  p_company_id TEXT,
  p_module_id TEXT,
  p_template_set_id TEXT,
  p_seeded_by TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO "demoSeedState"("companyId", "moduleId", "templateSetId", "status", "seededBy")
  VALUES (p_company_id, p_module_id, p_template_set_id, 'running', p_seeded_by)
  ON CONFLICT ("companyId", "moduleId")
  DO UPDATE SET
    "templateSetId" = EXCLUDED."templateSetId",
    "status" = 'running',
    "seededBy" = EXCLUDED."seededBy",
    "lastError" = NULL;

  -- Route per module
  IF p_module_id = 'Sales' THEN
    CALL seed_sales_demo(p_company_id, p_template_set_id);
  ELSIF p_module_id = 'Purchasing' THEN
    CALL seed_purchasing_demo(p_company_id, p_template_set_id);
  ELSIF p_module_id = 'Parts' THEN
    CALL seed_parts_demo(p_company_id, p_template_set_id);
  ELSIF p_module_id = 'Inventory' THEN
    CALL seed_inventory_demo(p_company_id, p_template_set_id);
  ELSE
    RAISE EXCEPTION 'No seeder registered for moduleId=%', p_module_id;
  END IF;

  UPDATE "demoSeedState"
  SET "status"='done', "seededAt"=NOW()
  WHERE "companyId"=p_company_id AND "moduleId"=p_module_id;

EXCEPTION WHEN OTHERS THEN
  UPDATE "demoSeedState"
  SET "status"='failed', "lastError"=SQLERRM
  WHERE "companyId"=p_company_id AND "moduleId"=p_module_id;
  RAISE;
END $$;

-- Seed multiple modules (industry chosen at signup)
-- Note: Must be a FUNCTION (not PROCEDURE) to be callable via Supabase RPC
CREATE OR REPLACE FUNCTION seed_demo(
  p_company_id TEXT,
  p_industry_id TEXT,
  p_module_ids TEXT[],
  p_seeded_by TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  m TEXT;
  ts_id TEXT;
BEGIN
  FOREACH m IN ARRAY p_module_ids LOOP
    SELECT "id" INTO ts_id
    FROM "templateSet"
    WHERE "industryId" = p_industry_id
      AND "moduleId"   = m
      AND "isSystem"   = TRUE
    ORDER BY "version" DESC
    LIMIT 1;

    IF ts_id IS NULL THEN
      RAISE EXCEPTION 'No enabled system template_set for industry=%, module=%', p_industry_id, m;
    END IF;

    CALL seed_demo_module(p_company_id, m, ts_id, p_seeded_by);
  END LOOP;
END $$;

-- =========================================
-- 10) Guardrail: detect template/live schema drift (CI/dashboard)
--     If you add a column to a table and forget demo_templates table, you'll see it.
-- =========================================
CREATE OR REPLACE VIEW "templateSchemaMismatches" AS
WITH live_cols AS (
  SELECT table_schema, table_name, column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name IN ('item','part','quote','quoteLine','purchaseOrder','purchaseOrderLine','customer','supplier')
),
tpl_cols AS (
  SELECT table_schema, table_name, column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'demo_templates'
    AND table_name IN ('item','part','quote','quoteLine','purchaseOrder','purchaseOrderLine','customer','supplier')
),
joined AS (
  SELECT
    l.table_name,
    l.column_name,
    l.data_type  AS live_type,
    t.data_type  AS tpl_type,
    l.is_nullable AS live_nullable,
    t.is_nullable AS tpl_nullable
  FROM live_cols l
  FULL OUTER JOIN tpl_cols t
    ON t.table_name = l.table_name
   AND t.column_name = l.column_name
)
SELECT *
FROM joined
WHERE
  -- ignore demo tracking columns that should exist only in live tables
  (column_name NOT IN ('isDemo','demoTemplateSetId','demoTemplateRowId','demoTouchedAt','createdAt','updatedAt','createdBy','updatedBy','companyId','id'))
  AND (
    -- Column exists in one but not the other (type mismatch)
    (tpl_type IS NULL AND live_type IS NOT NULL) OR
    (live_type IS NULL AND tpl_type IS NOT NULL) OR
    -- Data types don't match
    (tpl_type IS NOT NULL AND live_type IS NOT NULL AND tpl_type <> live_type)
    -- NOTE: We intentionally ignore nullable differences since templates may have different constraints
  );

-- Optional: hard fail in CI by calling this
CREATE OR REPLACE FUNCTION assert_no_template_schema_mismatches()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  cnt INTEGER;
  mismatch_details TEXT;
BEGIN
  SELECT COUNT(*) INTO cnt FROM "templateSchemaMismatches";
  IF cnt > 0 THEN
    -- Build detailed error message
    SELECT string_agg(
      format('Table: %s, Column: %s, Live: %s, Template: %s',
        table_name, column_name,
        COALESCE(live_type, 'MISSING'),
        COALESCE(tpl_type, 'MISSING')
      ),
      E'\n'
    ) INTO mismatch_details
    FROM "templateSchemaMismatches";

    RAISE EXCEPTION 'Template schema mismatches detected:%', E'\n' || mismatch_details;
  END IF;
END $$;

-- =========================================
-- 11) Helper function to check if demo data exists for a company
-- =========================================
CREATE OR REPLACE FUNCTION has_demo_data(p_company_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM "demoSeedState"
    WHERE "companyId" = p_company_id
      AND "status" = 'done'
  );
$$;

-- =========================================
-- 12) Helper function to get demo status for a company
-- =========================================
CREATE OR REPLACE FUNCTION get_demo_status(p_company_id TEXT)
RETURNS TABLE(
  "moduleId" TEXT,
  "status" TEXT,
  "seededAt" TIMESTAMP WITH TIME ZONE,
  "templateKey" TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s."moduleId",
    s."status",
    s."seededAt",
    ts."key" AS "templateKey"
  FROM "demoSeedState" s
  JOIN "templateSet" ts ON ts."id" = s."templateSetId"
  WHERE s."companyId" = p_company_id;
$$;
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
  "purchaseOrderType"     TEXT NOT NULL, -- will be cast to enum during seeding
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
-- =========================================
-- Demo Seeding Procedures
-- =========================================
-- This migration creates the seeding procedures for each module
-- with deterministic UUID mapping and FK graph handling.

-- =========================================
-- 1) Sales Module Seeding
-- =========================================
CREATE OR REPLACE PROCEDURE seed_sales_demo(
  p_company_id TEXT,
  p_template_set_id TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id TEXT;
BEGIN
  -- Get a user from the company to use as createdBy
  SELECT "userId" INTO v_user_id
  FROM "userToCompany"
  WHERE "companyId" = p_company_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found for company %', p_company_id;
  END IF;

  -- 1) Seed Customers (parents)
  INSERT INTO "customer" (
    "id", "companyId", "name", "customerTypeId", "customerStatusId", "taxId",
    "accountManagerId", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."name",
    t."customerTypeId",
    t."customerStatusId",
    t."taxId",
    v_user_id, -- Use actual user from company
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id
  FROM demo_templates.customer t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 2) Seed Items (parents)
  INSERT INTO "item" (
    "id", "companyId", "readableId", "name", "description", "type",
    "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "revision",
    "active", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."readableId",
    t."name",
    t."description",
    t."type"::"itemType",
    t."itemTrackingType"::"itemTrackingType",
    t."replenishmentSystem"::"itemReplenishmentSystem",
    t."unitOfMeasureCode",
    t."revision",
    t."active",
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id
  FROM demo_templates.item t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 3) Seed Quotes (parents)
  INSERT INTO "quote" (
    "id", "companyId", "quoteId", "customerId", "status", "expirationDate",
    "customerReference", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy", "revisionId", "currencyCode", "exchangeRate"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."quoteId",
    demo_id(p_company_id, t."tplCustomerId") AS "customerId",
    t."status"::"quoteStatus",
    t."expirationDate",
    t."customerReference",
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id,
    0, -- default revision
    'USD', -- default currency
    1.0 -- default exchange rate
  FROM demo_templates.quote t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 4) Seed Quote Lines (children referencing template IDs -> mapped via demo_id)
  -- quoteRevisionId should match the quote's revisionId (which we set to 0)
  INSERT INTO "quoteLine" (
    "id", "companyId", "quoteId", "quoteRevisionId", "itemId", "itemType", "description", "quantity",
    "methodType", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy"
  )
  SELECT
    demo_id(p_company_id, li."templateRowId") AS "id",
    p_company_id,
    demo_id(p_company_id, li."tplQuoteId") AS "quoteId",
    0 AS "quoteRevisionId",  -- Match quote's revisionId (set to 0)
    demo_id(p_company_id, li."tplItemId") AS "itemId",
    it."type"::"itemType",  -- Get item type from template item
    li."description",
    ARRAY[li."quantity"]::NUMERIC(20, 2)[] AS "quantity",  -- Convert to array format
    -- Map replenishmentSystem to methodType: 'Make' -> 'Make', 'Buy' -> 'Buy', 'Buy and Make' -> 'Make'
    CASE
      WHEN it."replenishmentSystem" = 'Buy' THEN 'Buy'::"methodType"
      WHEN it."replenishmentSystem" = 'Make' THEN 'Make'::"methodType"
      WHEN it."replenishmentSystem" = 'Buy and Make' THEN 'Make'::"methodType"
      ELSE 'Make'::"methodType"  -- Default fallback
    END AS "methodType",
    TRUE,
    p_template_set_id,
    li."templateRowId",
    v_user_id
  FROM demo_templates.quoteLine li
  JOIN demo_templates.item it ON it."templateSetId" = li."templateSetId" AND it."templateRowId" = li."tplItemId"
  WHERE li."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 5) Seed Quote Line Prices (pricing is stored in separate table)
  INSERT INTO "quoteLinePrice" (
    "quoteLineId", "quoteId", "quantity", "unitPrice", "discountPercent", "leadTime", "shippingCost",
    "createdBy"
  )
  SELECT
    demo_id(p_company_id, li."templateRowId") AS "quoteLineId",
    demo_id(p_company_id, li."tplQuoteId") AS "quoteId",
    li."quantity",
    li."unitPrice",
    0 AS "discountPercent",  -- Default discount
    0 AS "leadTime",         -- Default lead time
    0 AS "shippingCost",     -- Default shipping cost
    v_user_id
  FROM demo_templates.quoteLine li
  WHERE li."templateSetId" = p_template_set_id
  ON CONFLICT ("quoteLineId", "quantity") DO NOTHING;
END $$;

-- =========================================
-- 2) Purchasing Module Seeding
-- =========================================
CREATE OR REPLACE PROCEDURE seed_purchasing_demo(
  p_company_id TEXT,
  p_template_set_id TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id TEXT;
BEGIN
  -- Get a user from the company to use as createdBy
  SELECT "userId" INTO v_user_id
  FROM "userToCompany"
  WHERE "companyId" = p_company_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found for company %', p_company_id;
  END IF;

  -- 1) Seed Suppliers (parents)
  INSERT INTO "supplier" (
    "id", "companyId", "name", "supplierTypeId", "supplierStatusId", "taxId",
    "accountManagerId", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."name",
    t."supplierTypeId",
    t."supplierStatusId",
    t."taxId",
    v_user_id, -- Use actual user from company
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id
  FROM demo_templates.supplier t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 2) Seed Items (if not already seeded by Sales module)
  INSERT INTO "item" (
    "id", "companyId", "readableId", "name", "description", "type",
    "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "revision",
    "active", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."readableId",
    t."name",
    t."description",
    t."type"::"itemType",
    t."itemTrackingType"::"itemTrackingType",
    t."replenishmentSystem"::"itemReplenishmentSystem",
    t."unitOfMeasureCode",
    t."revision",
    t."active",
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id
  FROM demo_templates.item t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 2.5) Seed Supplier Interactions
  -- We need one per purchase order
  INSERT INTO "supplierInteraction" ("id", "companyId", "supplierId")
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    demo_id(p_company_id, t."tplSupplierId") AS "supplierId"
  FROM demo_templates.purchaseOrder t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 3) Seed Purchase Orders (parents)
  INSERT INTO "purchaseOrder" (
    "id", "companyId", "purchaseOrderId", "supplierId", "purchaseOrderType", "status", "orderDate",
    "supplierInteractionId",
    "isDemo", "demoTemplateSetId", "demoTemplateRowId", "createdBy",
    "currencyCode", "exchangeRate"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."purchaseOrderId",
    demo_id(p_company_id, t."tplSupplierId") AS "supplierId",
    t."purchaseOrderType"::"purchaseOrderType" AS "purchaseOrderType",
    t."status"::"purchaseOrderStatus",
    t."orderDate",
    demo_id(p_company_id, t."templateRowId") AS "supplierInteractionId",
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id,
    'USD', -- default currency
    1.0 -- default exchange rate
  FROM demo_templates.purchaseOrder t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 3a) Seed Purchase Order Delivery (stores dates)
  INSERT INTO "purchaseOrderDelivery" (
    "id", "companyId", "receiptRequestedDate", "receiptPromisedDate", "updatedBy"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."receiptRequestedDate",
    t."receiptPromisedDate",
    v_user_id
  FROM demo_templates.purchaseOrder t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 3b) Seed Purchase Order Payment
  INSERT INTO "purchaseOrderPayment" (
    "id", "companyId", "updatedBy"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    v_user_id
  FROM demo_templates.purchaseOrder t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 4) Seed Purchase Order Lines (children)
  INSERT INTO "purchaseOrderLine" (
    "id", "companyId", "purchaseOrderId", "purchaseOrderLineType", "itemId", "description", "purchaseQuantity",
    "supplierUnitPrice", "promisedDate", "isDemo",
    "demoTemplateSetId", "demoTemplateRowId", "createdBy",
    "exchangeRate"
  )
  SELECT
    demo_id(p_company_id, li."templateRowId") AS "id",
    p_company_id,
    demo_id(p_company_id, li."tplPurchaseOrderId") AS "purchaseOrderId",
    -- Map item type to purchaseOrderLineType (item types match enum values)
    CASE
      WHEN it."type" IN ('Part', 'Material', 'Tool', 'Service', 'Consumable', 'Fixture') THEN it."type"::"purchaseOrderLineType"
      ELSE 'Part'::"purchaseOrderLineType"  -- Default fallback
    END AS "purchaseOrderLineType",
    demo_id(p_company_id, li."tplItemId") AS "itemId",
    li."description",
    li."quantity" AS "purchaseQuantity",  -- Use purchaseQuantity column name
    li."unitPrice", -- Map unitPrice to supplierUnitPrice
    li."receiptPromisedDate" AS "promisedDate", -- Column is promisedDate
    TRUE,
    p_template_set_id,
    li."templateRowId",
    v_user_id,
    1.0 -- default exchange rate
  FROM demo_templates.purchaseOrderLine li
  JOIN demo_templates.item it ON it."templateSetId" = li."templateSetId" AND it."templateRowId" = li."tplItemId"
  WHERE li."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;
END $$;

-- =========================================
-- 3) Parts Module Seeding
-- =========================================
CREATE OR REPLACE PROCEDURE seed_parts_demo(
  p_company_id TEXT,
  p_template_set_id TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id TEXT;
BEGIN
  -- Get a user from the company to use as createdBy
  SELECT "userId" INTO v_user_id
  FROM "userToCompany"
  WHERE "companyId" = p_company_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found for company %', p_company_id;
  END IF;

  -- 1) Seed Items (if not already seeded)
  INSERT INTO "item" (
    "id", "companyId", "readableId", "name", "description", "type",
    "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "revision",
    "active", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."readableId",
    t."name",
    t."description",
    t."type"::"itemType",
    t."itemTrackingType"::"itemTrackingType",
    t."replenishmentSystem"::"itemReplenishmentSystem",
    t."unitOfMeasureCode",
    t."revision",
    t."active",
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id
  FROM demo_templates.item t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 2) Seed Parts
  -- Note: part table has composite primary key ("id", "companyId")
  -- part.id should be the same as item.id (1:1 relationship)
  INSERT INTO "part" (
    "id", "companyId", "approved", "fromDate", "toDate",
    "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."approved",
    t."fromDate",
    t."toDate",
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id
  FROM demo_templates.part t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id", "companyId") DO NOTHING;  -- Composite primary key
END $$;

-- =========================================
-- 4) Inventory Module Seeding
-- =========================================
CREATE OR REPLACE PROCEDURE seed_inventory_demo(
  p_company_id TEXT,
  p_template_set_id TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id TEXT;
BEGIN
  -- Get a user from the company to use as createdBy
  SELECT "userId" INTO v_user_id
  FROM "userToCompany"
  WHERE "companyId" = p_company_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found for company %', p_company_id;
  END IF;

  -- Seed Items (inventory is primarily item-based)
  INSERT INTO "item" (
    "id", "companyId", "readableId", "name", "description", "type",
    "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "revision",
    "active", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."readableId",
    t."name",
    t."description",
    t."type"::"itemType",
    t."itemTrackingType"::"itemTrackingType",
    t."replenishmentSystem"::"itemReplenishmentSystem",
    t."unitOfMeasureCode",
    t."revision",
    t."active",
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id
  FROM demo_templates.item t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;
END $$;

-- =========================================
-- 5) Helper: Reseed a module (cleanup + reseed)
-- =========================================
CREATE OR REPLACE PROCEDURE reseed_demo_module(
  p_company_id TEXT,
  p_module_id TEXT,
  p_template_set_id TEXT,
  p_seeded_by TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- First cleanup untouched demo data for this module
  IF p_module_id = 'Sales' THEN
    CALL cleanup_sales_demo_untouched(p_company_id);
  ELSIF p_module_id = 'Purchasing' THEN
    CALL cleanup_purchasing_demo_untouched(p_company_id);
  ELSIF p_module_id = 'Parts' THEN
    CALL cleanup_parts_demo_untouched(p_company_id);
  ELSIF p_module_id = 'Inventory' THEN
    CALL cleanup_inventory_demo_untouched(p_company_id);
  END IF;

  -- Then reseed
  CALL seed_demo_module(p_company_id, p_module_id, p_template_set_id, p_seeded_by);
END $$;
-- =========================================
-- Demo Cleanup Procedures
-- =========================================
-- This migration creates cleanup procedures that safely remove
-- ONLY untouched demo data (leaf-first, FK-safe).
-- Touched data (demoTouchedAt IS NOT NULL) is preserved.

-- =========================================
-- 1) Sales Module Cleanup
-- =========================================
CREATE OR REPLACE PROCEDURE cleanup_sales_demo_untouched(
  p_company_id TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Leaf/edge tables first (quote lines)
  DELETE FROM "quoteLine"
  WHERE "companyId" = p_company_id
    AND "isDemo" = TRUE
    AND "demoTouchedAt" IS NULL;

  -- Parent tables: only delete untouched records with no remaining children
  DELETE FROM "quote" q
  WHERE q."companyId" = p_company_id
    AND q."isDemo" = TRUE
    AND q."demoTouchedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "quoteLine" li
      WHERE li."quoteId" = q."id"
    );

  -- Items: only delete if no references remain
  DELETE FROM "item" i
  WHERE i."companyId" = p_company_id
    AND i."isDemo" = TRUE
    AND i."demoTouchedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "quoteLine" li
      WHERE li."itemId" = i."id"
    );

  -- Customers: only delete if no references remain
  DELETE FROM "customer" c
  WHERE c."companyId" = p_company_id
    AND c."isDemo" = TRUE
    AND c."demoTouchedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "quote" q
      WHERE q."customerId" = c."id"
    );
END $$;

-- =========================================
-- 2) Purchasing Module Cleanup
-- =========================================
CREATE OR REPLACE PROCEDURE cleanup_purchasing_demo_untouched(
  p_company_id TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Leaf/edge tables first (purchase order lines)
  DELETE FROM "purchaseOrderLine"
  WHERE "companyId" = p_company_id
    AND "isDemo" = TRUE
    AND "demoTouchedAt" IS NULL;

  -- Parent tables: only delete untouched records with no remaining children
  DELETE FROM "purchaseOrder" po
  WHERE po."companyId" = p_company_id
    AND po."isDemo" = TRUE
    AND po."demoTouchedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "purchaseOrderLine" li
      WHERE li."purchaseOrderId" = po."id"
    );

  -- Items: only delete if no references remain
  DELETE FROM "item" i
  WHERE i."companyId" = p_company_id
    AND i."isDemo" = TRUE
    AND i."demoTouchedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "purchaseOrderLine" li
      WHERE li."itemId" = i."id"
    );

  -- Suppliers: only delete if no references remain
  DELETE FROM "supplier" s
  WHERE s."companyId" = p_company_id
    AND s."isDemo" = TRUE
    AND s."demoTouchedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "purchaseOrder" po
      WHERE po."supplierId" = s."id"
    );

  -- Cleanup Supplier Interactions with no remaining purchase orders
  DELETE FROM "supplierInteraction" si
  WHERE si."companyId" = p_company_id
    AND NOT EXISTS (
      SELECT 1 FROM "purchaseOrder" po
      WHERE po."supplierInteractionId" = si."id"
    );
END $$;

-- =========================================
-- 3) Parts Module Cleanup
-- =========================================
CREATE OR REPLACE PROCEDURE cleanup_parts_demo_untouched(
  p_company_id TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete untouched parts
  DELETE FROM "part"
  WHERE "companyId" = p_company_id
    AND "isDemo" = TRUE
    AND "demoTouchedAt" IS NULL;

  -- Items: only delete if no references remain from any module
  DELETE FROM "item" i
  WHERE i."companyId" = p_company_id
    AND i."isDemo" = TRUE
    AND i."demoTouchedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "part" p
      WHERE p."id" = i."id"
    )
    AND NOT EXISTS (
      SELECT 1 FROM "quoteLine" ql
      WHERE ql."itemId" = i."id"
    )
    AND NOT EXISTS (
      SELECT 1 FROM "purchaseOrderLine" pol
      WHERE pol."itemId" = i."id"
    );
END $$;

-- =========================================
-- 4) Inventory Module Cleanup
-- =========================================
CREATE OR REPLACE PROCEDURE cleanup_inventory_demo_untouched(
  p_company_id TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Items: only delete if no references remain from any module
  DELETE FROM "item" i
  WHERE i."companyId" = p_company_id
    AND i."isDemo" = TRUE
    AND i."demoTouchedAt" IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM "part" p
      WHERE p."id" = i."id"
    )
    AND NOT EXISTS (
      SELECT 1 FROM "quoteLine" ql
      WHERE ql."itemId" = i."id"
    )
    AND NOT EXISTS (
      SELECT 1 FROM "purchaseOrderLine" pol
      WHERE pol."itemId" = i."id"
    );
END $$;

-- =========================================
-- 5) Cleanup all demo data for a company (nuclear option)
-- =========================================
CREATE OR REPLACE PROCEDURE cleanup_all_demo_data(
  p_company_id TEXT,
  p_include_touched BOOLEAN DEFAULT FALSE
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- This is a nuclear option that removes ALL demo data
  -- Use with caution!

  IF p_include_touched THEN
    -- Remove ALL demo data including touched
    DELETE FROM "quoteLine" WHERE "companyId" = p_company_id AND "isDemo" = TRUE;
    DELETE FROM "purchaseOrderLine" WHERE "companyId" = p_company_id AND "isDemo" = TRUE;
    DELETE FROM "quote" WHERE "companyId" = p_company_id AND "isDemo" = TRUE;
    DELETE FROM "purchaseOrder" WHERE "companyId" = p_company_id AND "isDemo" = TRUE;
    DELETE FROM "supplierInteraction" WHERE "companyId" = p_company_id;
    DELETE FROM "part" WHERE "companyId" = p_company_id AND "isDemo" = TRUE;
    DELETE FROM "item" WHERE "companyId" = p_company_id AND "isDemo" = TRUE;
    DELETE FROM "customer" WHERE "companyId" = p_company_id AND "isDemo" = TRUE;
    DELETE FROM "supplier" WHERE "companyId" = p_company_id AND "isDemo" = TRUE;
  ELSE
    -- Remove only untouched demo data
    CALL cleanup_sales_demo_untouched(p_company_id);
    CALL cleanup_purchasing_demo_untouched(p_company_id);
    CALL cleanup_parts_demo_untouched(p_company_id);
    CALL cleanup_inventory_demo_untouched(p_company_id);
  END IF;

  -- Clear the seed state
  DELETE FROM "demoSeedState" WHERE "companyId" = p_company_id;
END $$;

-- =========================================
-- 6) Lock demo data (prevent cleanup)
-- =========================================
CREATE OR REPLACE PROCEDURE lock_demo_data(
  p_company_id TEXT,
  p_module_id TEXT DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_module_id IS NULL THEN
    -- Lock all modules
    UPDATE "demoSeedState"
    SET "lockedAt" = NOW()
    WHERE "companyId" = p_company_id
      AND "lockedAt" IS NULL;
  ELSE
    -- Lock specific module
    UPDATE "demoSeedState"
    SET "lockedAt" = NOW()
    WHERE "companyId" = p_company_id
      AND "moduleId" = p_module_id
      AND "lockedAt" IS NULL;
  END IF;
END $$;

-- =========================================
-- 7) Get demo data statistics
-- =========================================
CREATE OR REPLACE FUNCTION get_demo_statistics(p_company_id TEXT)
RETURNS TABLE(
  "entity" TEXT,
  "totalCount" BIGINT,
  "demoCount" BIGINT,
  "touchedCount" BIGINT,
  "untouchedCount" BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 'items' AS "entity",
    COUNT(*) AS "totalCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE) AS "demoCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NOT NULL) AS "touchedCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NULL) AS "untouchedCount"
  FROM "item" WHERE "companyId" = p_company_id

  UNION ALL

  SELECT 'parts' AS "entity",
    COUNT(*) AS "totalCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE) AS "demoCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NOT NULL) AS "touchedCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NULL) AS "untouchedCount"
  FROM "part" WHERE "companyId" = p_company_id

  UNION ALL

  SELECT 'quotes' AS "entity",
    COUNT(*) AS "totalCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE) AS "demoCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NOT NULL) AS "touchedCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NULL) AS "untouchedCount"
  FROM "quote" WHERE "companyId" = p_company_id

  UNION ALL

  SELECT 'quoteLines' AS "entity",
    COUNT(*) AS "totalCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE) AS "demoCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NOT NULL) AS "touchedCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NULL) AS "untouchedCount"
  FROM "quoteLine" WHERE "companyId" = p_company_id

  UNION ALL

  SELECT 'purchaseOrders' AS "entity",
    COUNT(*) AS "totalCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE) AS "demoCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NOT NULL) AS "touchedCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NULL) AS "untouchedCount"
  FROM "purchaseOrder" WHERE "companyId" = p_company_id

  UNION ALL

  SELECT 'purchaseOrderLines' AS "entity",
    COUNT(*) AS "totalCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE) AS "demoCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NOT NULL) AS "touchedCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NULL) AS "untouchedCount"
  FROM "purchaseOrderLine" WHERE "companyId" = p_company_id

  UNION ALL

  SELECT 'customers' AS "entity",
    COUNT(*) AS "totalCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE) AS "demoCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NOT NULL) AS "touchedCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NULL) AS "untouchedCount"
  FROM "customer" WHERE "companyId" = p_company_id

  UNION ALL

  SELECT 'suppliers' AS "entity",
    COUNT(*) AS "totalCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE) AS "demoCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NOT NULL) AS "touchedCount",
    COUNT(*) FILTER (WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NULL) AS "untouchedCount"
  FROM "supplier" WHERE "companyId" = p_company_id;
$$;
