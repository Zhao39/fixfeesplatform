# Demo Template System - Quick Reference

## Quick Start

### Seed Demo Data
```sql
-- Seed multiple modules for a company
CALL seed_demo(
  'company-id',
  'cnc',
  ARRAY['Sales', 'Purchasing', 'Parts', 'Inventory'],
  'user-id'
);

-- Seed a single module
CALL seed_demo_module('company-id', 'Sales', 'cnc_sales_v1', 'user-id');
```

### Check Status
```sql
-- Check if company has demo data
SELECT has_demo_data('company-id');

-- Get seeding status
SELECT * FROM get_demo_status('company-id');

-- Get statistics
SELECT * FROM get_demo_statistics('company-id');
```

### Cleanup
```sql
-- Cleanup untouched demo data for a module
CALL cleanup_sales_demo_untouched('company-id');

-- Cleanup all untouched demo data
CALL cleanup_all_demo_data('company-id', FALSE);

-- Nuclear option: cleanup ALL demo data (including touched)
CALL cleanup_all_demo_data('company-id', TRUE);
```

## TypeScript Usage

### Import Utilities
```typescript
import {
  industries,
  demoModules,
  getRecommendedModules,
  buildTemplateSetKey,
  isDemoData,
  isDemoTouched,
  isDemoUntouched,
} from '@carbon/database/seed/demo';
```

### Get Recommended Modules
```typescript
const modules = getRecommendedModules('cnc');
// ['Sales', 'Purchasing', 'Inventory', 'Parts', 'Production', 'Resources']
```

### Check Demo Data
```typescript
if (isDemoData(item)) {
  console.log('This is demo data');

  if (isDemoTouched(item)) {
    console.log('User has edited this');
  } else {
    console.log('Untouched, safe to cleanup');
  }
}
```

### Trigger Seeding (Trigger.dev)
```typescript
import { seedDemoData } from '@carbon/jobs';

await seedDemoData.trigger({
  companyId: company.id,
  industryId: 'cnc',
  modules: ['Sales', 'Purchasing'],
  userId: user.id
});
```

## Available Industries

| ID | Name | Modules Available |
|----|------|-------------------|
| `general` | General Manufacturing | Sales, Parts, Inventory |
| `cnc` | CNC Machining | Sales, Purchasing, Parts, Inventory |
| `robotics` | Robotics | Sales, Parts, Inventory |
| `automotive` | Automotive | (Coming soon) |
| `aerospace` | Aerospace | (Coming soon) |
| `electronics` | Electronics | (Coming soon) |

## Available Modules

| ID | Name | Industries Available |
|----|------|---------------------|
| `Sales` | Sales | CNC, Robotics, General |
| `Purchasing` | Purchasing | CNC |
| `Parts` | Parts | CNC, Robotics, General |
| `Inventory` | Inventory | CNC, Robotics, General |
| `Production` | Production | (Coming soon) |
| `Resources` | Resources | (Coming soon) |
| `Accounting` | Accounting | (Coming soon) |

## Template Set Keys

Format: `{industry}.{module}.v{version}`

Examples:
- `cnc.sales.v1`
- `cnc.purchasing.v1`
- `cnc.parts.v1`
- `cnc.inventory.v1`
- `robotics.sales.v1`
- `robotics.parts.v1`
- `robotics.inventory.v1`
- `general.sales.v1`
- `general.parts.v1`
- `general.inventory.v1`

## Demo Tracking Columns

Add these to any table that supports demo data:

```sql
ALTER TABLE "yourTable"
  ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "demoTemplateSetId" TEXT REFERENCES "templateSet"("id") ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "demoTemplateRowId" TEXT,
  ADD COLUMN IF NOT EXISTS "demoTouchedAt" TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS "yourTable_isDemo_idx"
  ON "yourTable"("isDemo") WHERE "isDemo" = TRUE;

DROP TRIGGER IF EXISTS "yourTable_mark_demo_touched" ON "yourTable";
CREATE TRIGGER "yourTable_mark_demo_touched"
BEFORE UPDATE ON "yourTable"
FOR EACH ROW EXECUTE FUNCTION mark_demo_touched();
```

## Creating Template Data

### 1. Create Template Set
```sql
INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description")
VALUES ('industry_module_v1', 'industry', 'Module', 1, 'industry.module.v1', 'Name', 'Description');
```

### 2. Add Template Data
```sql
-- Parent entities (no FK dependencies)
INSERT INTO demo_templates.customer ("templateSetId", "templateRowId", "name", ...)
VALUES ('industry_module_v1', 'cust_001', 'Customer Name', ...);

INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", ...)
VALUES ('industry_module_v1', 'item_001', 'ITEM-001', 'Item Name', ...);

-- Child entities (with template FK references)
INSERT INTO demo_templates.quote ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", ...)
VALUES ('industry_module_v1', 'quote_001', 'Q-001', 'cust_001', ...);

INSERT INTO demo_templates.quoteLine ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", ...)
VALUES ('industry_module_v1', 'qline_001', 'quote_001', 'item_001', ...);
```

### 3. Create Seeding Procedure
```sql
CREATE OR REPLACE PROCEDURE seed_your_module_demo(
  p_company_id TEXT,
  p_template_set_id TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id TEXT;
BEGIN
  -- Get user
  SELECT "userId" INTO v_user_id
  FROM "userToCompany"
  WHERE "companyId" = p_company_id
  LIMIT 1;

  -- Seed parents first
  INSERT INTO "customer" (
    "id", "companyId", "name",
    "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy", "createdAt"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId"),
    p_company_id,
    t."name",
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id,
    NOW()
  FROM demo_templates.customer t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;

  -- Then children with FK mapping
  INSERT INTO "quote" (
    "id", "companyId", "quoteId", "customerId",
    "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy", "createdAt"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId"),
    p_company_id,
    t."quoteId",
    demo_id(p_company_id, t."tplCustomerId"),  -- FK mapping!
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id,
    NOW()
  FROM demo_templates.quote t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;
END $$;
```

### 4. Register in Router
```sql
-- Update seed_demo_module procedure
ELSIF p_module_id = 'YourModule' THEN
  CALL seed_your_module_demo(p_company_id, p_template_set_id);
```

## Common Queries

### Find Demo Data
```sql
-- Find all demo items
SELECT * FROM "item" WHERE "isDemo" = TRUE;

-- Find untouched demo items
SELECT * FROM "item" WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NULL;

-- Find touched demo items
SELECT * FROM "item" WHERE "isDemo" = TRUE AND "demoTouchedAt" IS NOT NULL;
```

### Check Schema Drift
```sql
-- View schema mismatches
SELECT * FROM "templateSchemaMismatches";

-- Assert no mismatches (for CI)
SELECT assert_no_template_schema_mismatches();
```

### Dashboard Queries
```sql
-- Seeding dashboard
SELECT * FROM "demoSeedDashboard" WHERE "companyId" = 'company-id';

-- Seed runs history
SELECT * FROM "demoSeedRun" WHERE "companyId" = 'company-id' ORDER BY "createdAt" DESC;

-- Module status
SELECT * FROM "demoSeedState" WHERE "companyId" = 'company-id';
```

## Troubleshooting

### "No enabled system template_set for industry=X, module=Y"
**Solution**: Create the template set and add template data.

### "No users found for company X"
**Solution**: Ensure the company has at least one user in `userToCompany`.

### FK constraint violation during seeding
**Solution**: Check seeding order - parents must be seeded before children.

### Duplicate key violation
**Solution**: Ensure you're using `ON CONFLICT DO NOTHING` in seeding procedures.

### Schema mismatch errors
**Solution**: Update template tables to match live tables. Check `templateSchemaMismatches` view.

## Best Practices

### ✅ DO
- Use `demo_id()` for deterministic ID generation
- Use descriptive template row IDs (`item_001`, `cust_acme`)
- Use `tpl*` prefix for template FK columns
- Seed in dependency order (parents → children)
- Use `ON CONFLICT DO NOTHING` for idempotency
- Add demo tracking columns to all seeded tables
- Check schema drift regularly

### ❌ DON'T
- Use `gen_random_uuid()` for demo data IDs
- Delete touched demo data
- Seed children before parents
- Change template row IDs after shipping
- Forget to add demo tracking columns
- Skip the schema mismatch check

## Performance Tips

- Seeding is fast (< 1 second per module for typical datasets)
- Use Trigger.dev for background seeding to avoid blocking signup
- Batch operations are atomic (all or nothing)
- Cleanup is safe and FK-aware (leaf-first deletion)
- Indexes on `isDemo` column improve query performance

## Support

For more information:
- Full documentation: `DEMO_TEMPLATES.md`
- Implementation summary: `DEMO_SYSTEM_SUMMARY.md`
- Migration files: `packages/database/supabase/migrations/20251217051513_*.sql`
- TypeScript utilities: `packages/database/src/seed/demo.ts`
