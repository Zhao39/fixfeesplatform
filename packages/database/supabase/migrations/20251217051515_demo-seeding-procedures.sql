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
    "createdBy", "createdAt"
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
    v_user_id,
    NOW()
  FROM demo_templates.customer t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 2) Seed Items (parents)
  INSERT INTO "item" (
    "id", "companyId", "readableId", "name", "description", "type",
    "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "revision",
    "active", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy", "createdAt"
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
    v_user_id,
    NOW()
  FROM demo_templates.item t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 3) Seed Quotes (parents)
  INSERT INTO "quote" (
    "id", "companyId", "quoteId", "customerId", "status", "expirationDate",
    "customerReference", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy", "createdAt", "revisionId"
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
    NOW(),
    0 -- default revision
  FROM demo_templates.quote t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 4) Seed Quote Lines (children referencing template IDs -> mapped via demo_id)
  INSERT INTO "quoteLine" (
    "id", "companyId", "quoteId", "itemId", "description", "quantity",
    "unitPrice", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy", "createdAt"
  )
  SELECT
    demo_id(p_company_id, li."templateRowId") AS "id",
    p_company_id,
    demo_id(p_company_id, li."tplQuoteId") AS "quoteId",
    demo_id(p_company_id, li."tplItemId") AS "itemId",
    li."description",
    li."quantity",
    li."unitPrice",
    TRUE,
    p_template_set_id,
    li."templateRowId",
    v_user_id,
    NOW()
  FROM demo_templates.quoteLine li
  WHERE li."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;
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
    "createdBy", "createdAt"
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
    v_user_id,
    NOW()
  FROM demo_templates.supplier t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 2) Seed Items (if not already seeded by Sales module)
  INSERT INTO "item" (
    "id", "companyId", "readableId", "name", "description", "type",
    "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "revision",
    "active", "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy", "createdAt"
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
    v_user_id,
    NOW()
  FROM demo_templates.item t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 3) Seed Purchase Orders (parents)
  INSERT INTO "purchaseOrder" (
    "id", "companyId", "purchaseOrderId", "supplierId", "status", "orderDate",
    "receiptPromisedDate", "receiptRequestedDate", "isDemo", "demoTemplateSetId",
    "demoTemplateRowId", "createdBy", "createdAt"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    t."purchaseOrderId",
    demo_id(p_company_id, t."tplSupplierId") AS "supplierId",
    t."status"::"purchaseOrderStatus",
    t."orderDate",
    t."receiptPromisedDate",
    t."receiptRequestedDate",
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id,
    NOW()
  FROM demo_templates.purchaseOrder t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 4) Seed Purchase Order Lines (children)
  INSERT INTO "purchaseOrderLine" (
    "id", "companyId", "purchaseOrderId", "itemId", "description", "quantity",
    "unitPrice", "receiptPromisedDate", "receiptRequestedDate", "isDemo",
    "demoTemplateSetId", "demoTemplateRowId", "createdBy", "createdAt"
  )
  SELECT
    demo_id(p_company_id, li."templateRowId") AS "id",
    p_company_id,
    demo_id(p_company_id, li."tplPurchaseOrderId") AS "purchaseOrderId",
    demo_id(p_company_id, li."tplItemId") AS "itemId",
    li."description",
    li."quantity",
    li."unitPrice",
    li."receiptPromisedDate",
    li."receiptRequestedDate",
    TRUE,
    p_template_set_id,
    li."templateRowId",
    v_user_id,
    NOW()
  FROM demo_templates.purchaseOrderLine li
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
    "createdBy", "createdAt"
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
    v_user_id,
    NOW()
  FROM demo_templates.item t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- 2) Seed Parts
  INSERT INTO "part" (
    "id", "companyId", "approved", "fromDate", "toDate",
    "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy", "createdAt"
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
    v_user_id,
    NOW()
  FROM demo_templates.part t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;
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
    "createdBy", "createdAt"
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
    v_user_id,
    NOW()
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
