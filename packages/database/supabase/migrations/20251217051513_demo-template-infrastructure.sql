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

CREATE TABLE IF NOT EXISTS "module" (
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
  "moduleId"      TEXT NOT NULL REFERENCES "module"("id") ON DELETE CASCADE,

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
  "moduleId"        TEXT NOT NULL REFERENCES "module"("id") ON DELETE CASCADE,
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
-- Namespace = companyId, Name = templateRowId::text
CREATE OR REPLACE FUNCTION demo_id(p_company_id TEXT, p_template_row_id TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT uuid_generate_v5(p_company_id::uuid, p_template_row_id)::TEXT;
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

INSERT INTO "module" ("id", "name", "description") VALUES
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
CREATE OR REPLACE PROCEDURE seed_demo(
  p_company_id TEXT,
  p_industry_id TEXT,
  p_module_ids TEXT[],
  p_seeded_by TEXT
)
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
      AND "isEnabled"  = TRUE
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
