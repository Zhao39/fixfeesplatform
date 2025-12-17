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
    SET "lockedAt" = NOW(), "updatedAt" = NOW()
    WHERE "companyId" = p_company_id
      AND "lockedAt" IS NULL;
  ELSE
    -- Lock specific module
    UPDATE "demoSeedState"
    SET "lockedAt" = NOW(), "updatedAt" = NOW()
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
