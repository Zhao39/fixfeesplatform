# Demo Template System

The Carbon demo template system provides industry-scoped, modular demo data that can be seeded into new company accounts. This system enables users to explore the platform with realistic, industry-specific data without having to manually create everything from scratch.

## Overview

The demo template system is built on these core principles:

1. **Industry + Module Scoped**: Templates are organized by industry (CNC, Robotics, Automotive, etc.) and module (Sales, Purchasing, Parts, etc.)
2. **Modular Seeding**: Seed the entire product or just specific modules
3. **Deterministic UUID Mapping**: Foreign key relationships "just work" through deterministic ID generation
4. **Idempotent Seeding**: Safe to run multiple times, won't create duplicates
5. **Demo Row Tracking**: All demo data is tracked and can be identified
6. **"Touched" Protection**: User-edited demo data is protected from cleanup operations
7. **Schema Guardrails**: Automated checks ensure template schemas stay in sync with live tables

## Architecture

### Database Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Public Schema                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   industry   │  │    module    │  │ templateSet  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │demoSeedState │  │ demoSeedRun  │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
│  Live Tables (with demo tracking columns):                  │
│  ┌──────────────────────────────────────────────────┐      │
│  │ item, part, quote, quoteLine, purchaseOrder,     │      │
│  │ purchaseOrderLine, customer, supplier, etc.      │      │
│  │                                                   │      │
│  │ Demo Tracking Columns:                           │      │
│  │ - isDemo: boolean                                │      │
│  │ - demoTemplateSetId: text                        │      │
│  │ - demoTemplateRowId: text                        │      │
│  │ - demoTouchedAt: timestamptz                     │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  demo_templates Schema                       │
│  Template Tables (stable template data):                    │
│  ┌──────────────────────────────────────────────────┐      │
│  │ item, part, quote, quoteLine, purchaseOrder,     │      │
│  │ purchaseOrderLine, customer, supplier            │      │
│  │                                                   │      │
│  │ Template Columns:                                │      │
│  │ - templateSetId: text (FK to templateSet)        │      │
│  │ - templateRowId: text (stable UUID)              │      │
│  │ - tpl*Id: text (template FK references)         │      │
│  │ - ... entity-specific fields                     │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Key Functions

#### `demo_id(company_id, template_row_id)`
Generates deterministic UUIDs for live data based on company ID and template row ID. This is the magic that makes FK relationships work without maintaining mapping tables.

```sql
SELECT demo_id('company-123', 'item_001');
-- Always returns the same UUID for this combination
```

#### `mark_demo_touched()`
Trigger function that automatically sets `demoTouchedAt` when a demo row is first edited by a user.

### Seeding Procedures

#### `seed_demo(company_id, industry_id, module_ids[], seeded_by)`
Seeds multiple modules for a company based on the selected industry.

```sql
CALL seed_demo(
  'company-123',
  'cnc',
  ARRAY['Sales', 'Purchasing', 'Parts', 'Inventory'],
  'user-456'
);
```

#### `seed_demo_module(company_id, module_id, template_set_id, seeded_by)`
Seeds a single module for a company.

```sql
CALL seed_demo_module(
  'company-123',
  'Sales',
  'cnc_sales_v1',
  'user-456'
);
```

#### Module-Specific Seeders
- `seed_sales_demo(company_id, template_set_id)`
- `seed_purchasing_demo(company_id, template_set_id)`
- `seed_parts_demo(company_id, template_set_id)`
- `seed_inventory_demo(company_id, template_set_id)`

### Cleanup Procedures

#### `cleanup_*_demo_untouched(company_id)`
Safely removes ONLY untouched demo data for a specific module (leaf-first, FK-safe).

```sql
CALL cleanup_sales_demo_untouched('company-123');
```

#### `cleanup_all_demo_data(company_id, include_touched)`
Nuclear option that removes all demo data. Use with caution!

```sql
-- Remove only untouched demo data
CALL cleanup_all_demo_data('company-123', FALSE);

-- Remove ALL demo data including touched
CALL cleanup_all_demo_data('company-123', TRUE);
```

#### `lock_demo_data(company_id, module_id)`
Locks demo data to prevent cleanup (useful when company starts using demo data for real).

```sql
-- Lock all modules
CALL lock_demo_data('company-123', NULL);

-- Lock specific module
CALL lock_demo_data('company-123', 'Sales');
```

### Helper Functions

#### `has_demo_data(company_id)`
Returns true if the company has any demo data seeded.

```sql
SELECT has_demo_data('company-123');
```

#### `get_demo_status(company_id)`
Returns the seeding status for all modules.

```sql
SELECT * FROM get_demo_status('company-123');
```

#### `get_demo_statistics(company_id)`
Returns statistics about demo data (total, demo, touched, untouched counts).

```sql
SELECT * FROM get_demo_statistics('company-123');
```

## Available Industries

| ID | Name | Description |
|----|------|-------------|
| `general` | General Manufacturing | General purpose manufacturing templates |
| `cnc` | CNC Machining | Computer numerical control machining operations |
| `robotics` | Robotics | Robotics manufacturing and assembly |
| `automotive` | Automotive | Automotive parts and assembly |
| `aerospace` | Aerospace | Aerospace and aviation manufacturing |
| `electronics` | Electronics | Electronics manufacturing and assembly |

## Available Modules

| ID | Name | Description | Template Sets Available |
|----|------|-------------|------------------------|
| `Sales` | Sales | Quotes, orders, and customer management | CNC, Robotics, General |
| `Purchasing` | Purchasing | Purchase orders and supplier management | CNC |
| `Parts` | Parts | Parts and bill of materials | CNC, Robotics, General |
| `Inventory` | Inventory | Inventory tracking and management | CNC, Robotics, General |
| `Production` | Production | Manufacturing execution and job management | Coming soon |
| `Resources` | Resources | Equipment, work centers, and resources | Coming soon |
| `Accounting` | Accounting | General ledger and financial management | Coming soon |
| `Documents` | Documents | Document management and storage | Coming soon |
| `Invoicing` | Invoicing | Sales and purchase invoicing | Coming soon |
| `Settings` | Settings | System configuration and settings | Coming soon |
| `Users` | Users | User and permission management | Coming soon |

## Template Sets

### CNC Machining

#### cnc.sales.v1
- **3 Customers**: Precision Aerospace Inc, AutoTech Manufacturing, Medical Device Solutions
- **5 Items**: Aluminum Bracket, Titanium Housing, Stainless Steel Shaft, Mounting Plate, Custom Adapter
- **3 Quotes**: Q-2024-001, Q-2024-002, Q-2024-003
- **5 Quote Lines**: Various quantities and pricing

#### cnc.purchasing.v1
- **3 Suppliers**: Metal Supply Co, Tooling Solutions Inc, Industrial Materials Ltd
- **5 Items**: Raw materials (Aluminum, Titanium, Stainless Steel) and tooling
- **3 Purchase Orders**: PO-2024-001, PO-2024-002, PO-2024-003
- **5 PO Lines**: Various quantities and pricing

#### cnc.parts.v1
- **11 Items**:
  - 3 Finished goods (assemblies)
  - 4 Sub-assemblies (machined components)
  - 4 Purchased components (hardware, seals, bearings)
- **7 Parts**: Approved parts with manufacturing details

#### cnc.inventory.v1
- **16 Items**:
  - 7 Raw materials (aluminum, titanium, stainless steel bar stock and plates)
  - 6 Tooling (end mills, drill bits, taps)
  - 3 Consumables (cutting fluid, wipes, gloves)

### Robotics

#### robotics.sales.v1
- **3 Customers**: Automation Systems Corp, Industrial Robotics Ltd, Smart Factory Solutions
- **4 Items**: 6-Axis Robot Arm, Pneumatic Gripper, Robot Controller, Vision Sensor System
- **2 Quotes**: Q-ROB-001, Q-ROB-002
- **4 Quote Lines**: High-value robotics equipment

#### robotics.parts.v1
- **10 Items**:
  - 5 Robot assemblies (arm, base, joints)
  - 5 Sub-components (motors, encoders, gearboxes, cables)
- **5 Parts**: Approved robot assemblies

#### robotics.inventory.v1
- **14 Items**:
  - 5 Electronic components (PLC, servo drives, sensors, relays)
  - 5 Pneumatic components (valves, cylinders, grippers, fittings)
  - 4 Mechanical components (bearings, timing belts, pulleys)

### General Manufacturing

#### general.sales.v1
- **2 Customers**: ABC Manufacturing, XYZ Industries
- **3 Items**: Standard Widget, Premium Widget, Widget Assembly
- **1 Quote**: Q-GEN-001
- **3 Quote Lines**: Various widget products

#### general.parts.v1
- **7 Items**:
  - 3 Finished products (widgets and assemblies)
  - 4 Components (base, top, spring, screws)
- **5 Parts**: Approved parts

#### general.inventory.v1
- **13 Items**:
  - 3 Raw materials (steel sheet, plastic, plywood)
  - 5 Hardware (screws, nuts, washers)
  - 4 Packaging (boxes, tape, bubble wrap)

## Usage Examples

### Seed Demo Data at Company Signup

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Seed demo data for a new CNC company
await supabase.rpc('seed_demo', {
  p_company_id: companyId,
  p_industry_id: 'cnc',
  p_module_ids: ['Sales', 'Purchasing', 'Parts', 'Inventory'],
  p_seeded_by: userId
});
```

### Check Demo Status

```typescript
const { data } = await supabase
  .rpc('get_demo_status', { p_company_id: companyId });

console.log(data);
// [
//   { moduleId: 'Sales', status: 'done', seededAt: '2024-01-15T10:30:00Z', templateKey: 'cnc.sales.v1' },
//   { moduleId: 'Purchasing', status: 'done', seededAt: '2024-01-15T10:30:05Z', templateKey: 'cnc.purchasing.v1' },
//   ...
// ]
```

### Get Demo Statistics

```typescript
const { data } = await supabase
  .rpc('get_demo_statistics', { p_company_id: companyId });

console.log(data);
// [
//   { entity: 'items', totalCount: 25, demoCount: 20, touchedCount: 3, untouchedCount: 17 },
//   { entity: 'quotes', totalCount: 5, demoCount: 3, touchedCount: 1, untouchedCount: 2 },
//   ...
// ]
```

### Cleanup Untouched Demo Data

```typescript
// Remove untouched sales demo data
await supabase.rpc('cleanup_sales_demo_untouched', {
  p_company_id: companyId
});

// Or remove all untouched demo data
await supabase.rpc('cleanup_all_demo_data', {
  p_company_id: companyId,
  p_include_touched: false
});
```

## TypeScript Utilities

The `@carbon/database` package exports helpful utilities:

```typescript
import {
  industries,
  demoModules,
  getRecommendedModules,
  buildTemplateSetKey,
  isDemoData,
  isDemoTouched,
  isDemoUntouched,
  industryInfo,
  moduleInfo
} from '@carbon/database/seed/demo';

// Get recommended modules for an industry
const modules = getRecommendedModules('cnc');
// ['Sales', 'Purchasing', 'Inventory', 'Parts', 'Production', 'Resources']

// Build a template set key
const key = buildTemplateSetKey('cnc', 'Sales', 1);
// 'cnc.sales.v1'

// Check if an entity is demo data
if (isDemoData(item)) {
  console.log('This is demo data');
}

// Check if demo data has been touched
if (isDemoTouched(item)) {
  console.log('User has edited this demo data');
}

// Get industry information
console.log(industryInfo.cnc);
// { name: 'CNC Machining', description: 'Computer numerical control machining operations' }
```

## Schema Guardrails

The system includes a view that detects schema drift between live tables and template tables:

```sql
-- Check for schema mismatches
SELECT * FROM "templateSchemaMismatches";

-- Hard fail in CI (useful for migrations)
SELECT assert_no_template_schema_mismatches();
```

This ensures that when you add/modify columns in live tables, you don't forget to update the corresponding template tables.

## Adding New Template Data

### 1. Create Template Set

```sql
INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('aerospace_sales_v1', 'aerospace', 'Sales', 1, 'aerospace.sales.v1', 'Aerospace Sales Demo', 'Demo data for aerospace sales', TRUE);
```

### 2. Add Template Data

```sql
-- Add template customers
INSERT INTO demo_templates.customer ("templateSetId", "templateRowId", "name", ...)
VALUES
  ('aerospace_sales_v1', 'cust_001', 'Boeing', ...),
  ('aerospace_sales_v1', 'cust_002', 'Airbus', ...);

-- Add template items
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", ...)
VALUES
  ('aerospace_sales_v1', 'item_001', 'AERO-001', 'Wing Component', ...);

-- Add template quotes
INSERT INTO demo_templates.quote ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", ...)
VALUES
  ('aerospace_sales_v1', 'quote_001', 'Q-AERO-001', 'cust_001', ...);

-- Add template quote lines (note the tpl* FK references)
INSERT INTO demo_templates.quoteLine ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", ...)
VALUES
  ('aerospace_sales_v1', 'qline_001', 'quote_001', 'item_001', ...);
```

### 3. Update Seeding Procedure (if new module)

If you're adding a new module, update the `seed_demo_module` procedure:

```sql
-- In migration 20251217051513_demo-template-infrastructure.sql
-- Add to the ELSIF chain:
ELSIF p_module_id = 'YourNewModule' THEN
  CALL seed_your_new_module_demo(p_company_id, p_template_set_id);
```

### 4. Create Module Seeder

Create a new seeding procedure for your module:

```sql
CREATE OR REPLACE PROCEDURE seed_your_new_module_demo(
  p_company_id TEXT,
  p_template_set_id TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_id TEXT;
BEGIN
  -- Get a user from the company
  SELECT "userId" INTO v_user_id
  FROM "userToCompany"
  WHERE "companyId" = p_company_id
  LIMIT 1;

  -- Seed parents first, then children
  -- Use demo_id() for deterministic ID mapping
  -- Always include: isDemo=TRUE, demoTemplateSetId, demoTemplateRowId

  INSERT INTO "yourTable" (
    "id", "companyId", ...,
    "isDemo", "demoTemplateSetId", "demoTemplateRowId",
    "createdBy", "createdAt"
  )
  SELECT
    demo_id(p_company_id, t."templateRowId") AS "id",
    p_company_id,
    ...,
    TRUE,
    p_template_set_id,
    t."templateRowId",
    v_user_id,
    NOW()
  FROM demo_templates.yourTable t
  WHERE t."templateSetId" = p_template_set_id
  ON CONFLICT ("id") DO NOTHING;
END $$;
```

## Best Practices

### 1. Deterministic IDs
Always use `demo_id(company_id, template_row_id)` for generating live IDs. Never use `gen_random_uuid()` or other random ID generation.

### 2. Template Row IDs
Use descriptive, stable template row IDs like `'item_001'`, `'cust_acme'`, `'quote_q1'`. These never change once shipped.

### 3. FK References in Templates
In template tables, use `tpl*` prefix for FK columns that reference other template rows:
- `tplCustomerId` references `customer.templateRowId`
- `tplItemId` references `item.templateRowId`
- `tplQuoteId` references `quote.templateRowId`

### 4. Seeding Order
Always seed in dependency order (parents before children):
1. Independent entities (customers, suppliers, items without dependencies)
2. Parent entities (quotes, purchase orders)
3. Child entities (quote lines, purchase order lines)
4. Join/edge tables

### 5. Idempotency
Always use `ON CONFLICT DO NOTHING` to make seeding idempotent.

### 6. Demo Tracking
Always include these columns when seeding:
```sql
"isDemo" = TRUE,
"demoTemplateSetId" = p_template_set_id,
"demoTemplateRowId" = t."templateRowId",
"createdBy" = v_user_id,
"createdAt" = NOW()
```

### 7. Cleanup Safety
When creating cleanup procedures:
- Always delete leaf/edge tables first
- Only delete untouched rows (`demoTouchedAt IS NULL`)
- Check for remaining references before deleting parents
- Use transactions for safety

### 8. Testing
Test your templates by:
1. Seeding to a test company
2. Verifying all data appears correctly
3. Verifying FK relationships work
4. Editing some demo data (should set `demoTouchedAt`)
5. Running cleanup (should only remove untouched data)
6. Running schema mismatch check

## Trigger.dev Integration

The demo seeding system is designed to be called from Trigger.dev jobs for background processing:

```typescript
// In your Trigger.dev task
export const seedDemoData = task({
  id: "seed-demo-data",
  run: async (payload: { companyId: string; industryId: string; modules: string[]; userId: string }) => {
    // Create seed run record
    const { data: seedRun } = await supabase
      .from('demoSeedRun')
      .insert({
        companyId: payload.companyId,
        requestedBy: payload.userId,
        industryId: payload.industryId,
        requestedModules: payload.modules,
        status: 'running'
      })
      .select()
      .single();

    try {
      // Call the seeding procedure
      await supabase.rpc('seed_demo', {
        p_company_id: payload.companyId,
        p_industry_id: payload.industryId,
        p_module_ids: payload.modules,
        p_seeded_by: payload.userId
      });

      // Update run status
      await supabase
        .from('demoSeedRun')
        .update({ status: 'done', finishedAt: new Date().toISOString() })
        .eq('id', seedRun.id);

    } catch (error) {
      // Update run status with error
      await supabase
        .from('demoSeedRun')
        .update({
          status: 'failed',
          error: { message: error.message },
          finishedAt: new Date().toISOString()
        })
        .eq('id', seedRun.id);

      throw error;
    }
  }
});
```

## Troubleshooting

### Schema Mismatch Errors
If you get "Template schema mismatches detected" errors:
1. Check the `templateSchemaMismatches` view to see which columns are out of sync
2. Update the corresponding template table to match the live table
3. Remember to exclude demo tracking columns (`isDemo`, `demoTemplateSetId`, `demoTemplateRowId`, `demoTouchedAt`)

### FK Constraint Violations
If you get FK constraint violations during seeding:
1. Check that you're seeding in the correct order (parents before children)
2. Verify that template FK references use the correct `templateRowId` values
3. Ensure all referenced template rows exist in the template tables

### Duplicate Key Violations
If you get duplicate key violations:
1. Check that you're using `ON CONFLICT DO NOTHING`
2. Verify that `demo_id()` is being called consistently
3. Ensure template row IDs are unique within each template set

### Missing User Errors
If you get "No users found for company" errors:
1. Ensure the company has at least one user in the `userToCompany` table
2. Consider creating a default system user for seeding if needed

## Future Enhancements

- [ ] User-created template sets (not just system templates)
- [ ] Template versioning and migration paths
- [ ] Template marketplace/sharing
- [ ] More industries (Medical, Food & Beverage, etc.)
- [ ] More modules (Production, Resources, Accounting, etc.)
- [ ] Template preview/comparison UI
- [ ] Bulk template operations
- [ ] Template analytics (which templates are most used, etc.)
