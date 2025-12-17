-- =========================================
-- Demo Seed Data - Sales Module Templates
-- =========================================
-- This migration creates demo templates for the 4 specific industries.
-- These are the actual template data that will be seeded into companies.

-- =========================================
-- 1) HumanoTech Robotics (Robotics OEM) - Sales Module
-- =========================================

-- Create template set
INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_sales_v1', 'robotics_oem', 'Sales', 1, 'robotics_oem.sales.v1', 'HumanoTech Robotics Sales Demo', 'Demo data for humanoid robot manufacturing sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Customers
INSERT INTO demo_templates.customer ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('robotics_oem_sales_v1', 'cust_001', 'SmartFactory Automation', NULL, NULL, '45-1234567'),
  ('robotics_oem_sales_v1', 'cust_002', 'Global Logistics Corp', NULL, NULL, '78-9876543'),
  ('robotics_oem_sales_v1', 'cust_003', 'Healthcare Robotics Solutions', NULL, NULL, '23-4567890')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('robotics_oem_sales_v1', 'item_001', 'HUM-R1', 'HumanoBot R1', 'Entry-level humanoid robot for warehouse automation', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_002', 'HUM-R2-PRO', 'HumanoBot R2 Pro', 'Advanced humanoid robot with AI vision system', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_003', 'HUM-ARM-KIT', 'Dual Arm Upgrade Kit', 'Precision dual-arm manipulation system', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_004', 'HUM-GRIP-ADV', 'Advanced Gripper Set', 'Multi-purpose gripper system with force feedback', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_005', 'HUM-NAV-SYS', 'Autonomous Navigation System', 'LiDAR-based navigation and obstacle avoidance', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes
INSERT INTO demo_templates.quote ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('robotics_oem_sales_v1', 'quote_001', 'Q-2025-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'SMART-WAREHOUSE-2025'),
  ('robotics_oem_sales_v1', 'quote_002', 'Q-2025-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'LOG-AUTO-456'),
  ('robotics_oem_sales_v1', 'quote_003', 'Q-2025-003', 'cust_003', 'Draft', CURRENT_DATE + INTERVAL '60 days', 'HEALTH-BOT-789')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines
INSERT INTO demo_templates.quoteLine ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('robotics_oem_sales_v1', 'qline_001', 'quote_001', 'item_001', 'HumanoBot R1 - Standard Config', 5, 85000.00),
  ('robotics_oem_sales_v1', 'qline_002', 'quote_001', 'item_004', 'Advanced Gripper Set', 10, 8500.00),
  ('robotics_oem_sales_v1', 'qline_003', 'quote_002', 'item_002', 'HumanoBot R2 Pro - Full AI Suite', 3, 145000.00),
  ('robotics_oem_sales_v1', 'qline_004', 'quote_002', 'item_005', 'Autonomous Navigation System', 3, 22000.00),
  ('robotics_oem_sales_v1', 'qline_005', 'quote_003', 'item_002', 'HumanoBot R2 Pro - Healthcare Config', 2, 165000.00),
  ('robotics_oem_sales_v1', 'qline_006', 'quote_003', 'item_003', 'Dual Arm Upgrade Kit', 2, 35000.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 2) SkyLine Precision Parts (CNC Aerospace) - Sales Module
-- =========================================

-- Create template set
INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_sales_v1', 'cnc_aerospace', 'Sales', 1, 'cnc_aerospace.sales.v1', 'SkyLine Precision Parts Sales Demo', 'Demo data for aerospace CNC machining sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Customers
INSERT INTO demo_templates.customer ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('cnc_aerospace_sales_v1', 'cust_001', 'AeroSpace Dynamics', NULL, NULL, '12-3456789'),
  ('cnc_aerospace_sales_v1', 'cust_002', 'Satellite Systems Inc', NULL, NULL, '98-7654321'),
  ('cnc_aerospace_sales_v1', 'cust_003', 'Defense Aviation Corp', NULL, NULL, '45-6789012')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('cnc_aerospace_sales_v1', 'item_001', 'ASP-BRK-7075', 'Aluminum 7075 Bracket', 'Aerospace-grade aluminum bracket with AS9100 cert', 'Manufactured', 'Lot Number', 'Make to Order', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_002', 'ASP-TI-HSG', 'Titanium Housing Assembly', 'Ti-6Al-4V housing for satellite components', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_003', 'ASP-COMP-PLT', 'Carbon Composite Plate', 'CNC machined carbon fiber composite plate', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_004', 'ASP-MNT-BLK', 'Mounting Block Assembly', 'Precision mounting block with threaded inserts', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_005', 'ASP-STRUT-TI', 'Titanium Strut', 'Lightweight titanium strut for airframe', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes
INSERT INTO demo_templates.quote ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('cnc_aerospace_sales_v1', 'quote_001', 'Q-ASP-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'RFQ-AERO-2025-045'),
  ('cnc_aerospace_sales_v1', 'quote_002', 'Q-ASP-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'SAT-COMP-789'),
  ('cnc_aerospace_sales_v1', 'quote_003', 'Q-ASP-003', 'cust_003', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'DEF-QUOTE-456')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines
INSERT INTO demo_templates.quoteLine ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('cnc_aerospace_sales_v1', 'qline_001', 'quote_001', 'item_001', 'Aluminum 7075 Bracket - AS9100 Certified', 250, 125.00),
  ('cnc_aerospace_sales_v1', 'qline_002', 'quote_001', 'item_004', 'Mounting Block Assembly', 250, 85.00),
  ('cnc_aerospace_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Titanium Housing Assembly - Satellite Grade', 50, 875.00),
  ('cnc_aerospace_sales_v1', 'qline_004', 'quote_002', 'item_003', 'Carbon Composite Plate', 100, 450.00),
  ('cnc_aerospace_sales_v1', 'qline_005', 'quote_003', 'item_005', 'Titanium Strut - Airframe Component', 150, 320.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 3) TitanFab Industries (Metal Fabrication) - Sales Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fab_sales_v1', 'metal_fabrication', 'Sales', 1, 'metal_fabrication.sales.v1', 'TitanFab Industries Sales Demo', 'Demo data for structural metal fabrication sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Customers
INSERT INTO demo_templates.customer ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('metal_fab_sales_v1', 'cust_001', 'BuildRight Construction', NULL, NULL, '33-2468135'),
  ('metal_fab_sales_v1', 'cust_002', 'Industrial Steel Solutions', NULL, NULL, '44-1357924'),
  ('metal_fab_sales_v1', 'cust_003', 'Metro Infrastructure Group', NULL, NULL, '55-9876543')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('metal_fab_sales_v1', 'item_001', 'TF-BEAM-W12', 'W12x26 Steel I-Beam', 'Structural steel I-beam, 20ft length', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),
  ('metal_fab_sales_v1', 'item_002', 'TF-TRUSS-CUST', 'Custom Steel Truss', 'Welded steel truss assembly per spec', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),
  ('metal_fab_sales_v1', 'item_003', 'TF-PLATE-BASE', 'Steel Base Plate', 'Heavy-duty base plate with anchor holes', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),
  ('metal_fab_sales_v1', 'item_004', 'TF-RAIL-GUARD', 'Safety Guard Rail', 'Welded steel guard rail system', 'Manufactured', 'None', 'Make to Order', 'FT', TRUE),
  ('metal_fab_sales_v1', 'item_005', 'TF-FRAME-DOOR', 'Steel Door Frame', 'Industrial steel door frame assembly', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes
INSERT INTO demo_templates.quote ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('metal_fab_sales_v1', 'quote_001', 'Q-TF-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'BUILD-2025-789'),
  ('metal_fab_sales_v1', 'quote_002', 'Q-TF-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'IND-STEEL-456'),
  ('metal_fab_sales_v1', 'quote_003', 'Q-TF-003', 'cust_003', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'METRO-INFRA-123')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines
INSERT INTO demo_templates.quoteLine ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('metal_fab_sales_v1', 'qline_001', 'quote_001', 'item_001', 'W12x26 Steel I-Beam - 20ft', 50, 285.00),
  ('metal_fab_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Steel Base Plate - Heavy Duty', 50, 125.00),
  ('metal_fab_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Custom Steel Truss - Per Drawing TF-2025-A', 12, 1850.00),
  ('metal_fab_sales_v1', 'qline_004', 'quote_002', 'item_005', 'Steel Door Frame Assembly', 25, 385.00),
  ('metal_fab_sales_v1', 'qline_005', 'quote_003', 'item_004', 'Safety Guard Rail System', 500, 45.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 4) Apex Motors Engineering (Automotive Precision) - Sales Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('auto_precision_sales_v1', 'automotive_precision', 'Sales', 1, 'automotive_precision.sales.v1', 'Apex Motors Engineering Sales Demo', 'Demo data for high-performance automotive parts sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Customers
INSERT INTO demo_templates.customer ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('auto_precision_sales_v1', 'cust_001', 'Performance Racing Systems', NULL, NULL, '66-1122334'),
  ('auto_precision_sales_v1', 'cust_002', 'Velocity Motorsports', NULL, NULL, '77-4455667'),
  ('auto_precision_sales_v1', 'cust_003', 'Elite Automotive Group', NULL, NULL, '88-7788990')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('auto_precision_sales_v1', 'item_001', 'APX-PISTON-HP', 'High-Performance Piston Set', 'Forged aluminum pistons for racing engines', 'Manufactured', 'Serial Number', 'Make to Order', 'SET', TRUE),
  ('auto_precision_sales_v1', 'item_002', 'APX-CRANK-TI', 'Titanium Crankshaft', 'Precision-balanced titanium crankshaft', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('auto_precision_sales_v1', 'item_003', 'APX-VALVE-SS', 'Stainless Valve Set', 'High-temp stainless steel valve set', 'Manufactured', 'None', 'Make to Order', 'SET', TRUE),
  ('auto_precision_sales_v1', 'item_004', 'APX-TURBO-HSG', 'Turbo Housing Assembly', 'CNC machined turbo housing with wastegate', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('auto_precision_sales_v1', 'item_005', 'APX-GEAR-SET', 'Transmission Gear Set', 'Precision-cut transmission gear set', 'Manufactured', 'Serial Number', 'Make to Order', 'SET', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes
INSERT INTO demo_templates.quote ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('auto_precision_sales_v1', 'quote_001', 'Q-APX-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'RACE-ENG-2025'),
  ('auto_precision_sales_v1', 'quote_002', 'Q-APX-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'VEL-BUILD-789'),
  ('auto_precision_sales_v1', 'quote_003', 'Q-APX-003', 'cust_003', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'ELITE-PERF-456')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines
INSERT INTO demo_templates.quoteLine ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('auto_precision_sales_v1', 'qline_001', 'quote_001', 'item_001', 'High-Performance Piston Set - Racing Spec', 10, 2850.00),
  ('auto_precision_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Stainless Valve Set - High Temp', 10, 1250.00),
  ('auto_precision_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Titanium Crankshaft - Balanced', 5, 8500.00),
  ('auto_precision_sales_v1', 'qline_004', 'quote_002', 'item_004', 'Turbo Housing Assembly - Complete', 5, 3200.00),
  ('auto_precision_sales_v1', 'qline_005', 'quote_003', 'item_005', 'Transmission Gear Set - Precision Cut', 8, 4750.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- Summary of Template Sets Created
-- =========================================
-- HumanoTech Robotics (robotics_oem):
--   - robotics_oem.sales.v1: 3 customers, 5 items, 3 quotes, 6 quote lines
--   - High-value humanoid robots ($85K-$165K per unit)
--
-- SkyLine Precision Parts (cnc_aerospace):
--   - cnc_aerospace.sales.v1: 3 customers, 5 items, 3 quotes, 5 quote lines
--   - Aerospace-grade CNC parts with certifications ($85-$875 per unit)
--
-- TitanFab Industries (metal_fabrication):
--   - metal_fabrication.sales.v1: 3 customers, 5 items, 3 quotes, 5 quote lines
--   - Structural steel fabrication ($45-$1,850 per unit)
--
-- Apex Motors Engineering (automotive_precision):
--   - automotive_precision.sales.v1: 3 customers, 5 items, 3 quotes, 5 quote lines
--   - High-performance automotive parts ($1,250-$8,500 per unit)
