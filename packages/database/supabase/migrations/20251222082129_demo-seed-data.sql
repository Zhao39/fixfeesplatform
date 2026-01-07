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
INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('robotics_oem_sales_v1', 'cust_001', 'SmartFactory Automation', NULL, NULL, '45-1234567'),
  ('robotics_oem_sales_v1', 'cust_002', 'Global Logistics Corp', NULL, NULL, '78-9876543'),
  ('robotics_oem_sales_v1', 'cust_003', 'Healthcare Robotics Solutions', NULL, NULL, '23-4567890')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('robotics_oem_sales_v1', 'item_001', 'HUM-R1', 'HumanoBot R1', 'Entry-level humanoid robot for warehouse automation', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_002', 'HUM-R2-PRO', 'HumanoBot R2 Pro', 'Advanced humanoid robot with AI vision system', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_003', 'HUM-ARM-KIT', 'Dual Arm Upgrade Kit', 'Precision dual-arm manipulation system', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_004', 'HUM-GRIP-ADV', 'Advanced Gripper Set', 'Multi-purpose gripper system with force feedback', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_005', 'HUM-NAV-SYS', 'Autonomous Navigation System', 'LiDAR-based navigation and obstacle avoidance', 'Part', 'Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes
INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('robotics_oem_sales_v1', 'quote_001', 'Q-2025-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'SMART-WAREHOUSE-2025'),
  ('robotics_oem_sales_v1', 'quote_002', 'Q-2025-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'LOG-AUTO-456'),
  ('robotics_oem_sales_v1', 'quote_003', 'Q-2025-003', 'cust_003', 'Draft', CURRENT_DATE + INTERVAL '60 days', 'HEALTH-BOT-789')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines
INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
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
INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('cnc_aerospace_sales_v1', 'cust_001', 'AeroSpace Dynamics', NULL, NULL, '12-3456789'),
  ('cnc_aerospace_sales_v1', 'cust_002', 'Satellite Systems Inc', NULL, NULL, '98-7654321'),
  ('cnc_aerospace_sales_v1', 'cust_003', 'Defense Aviation Corp', NULL, NULL, '45-6789012')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('cnc_aerospace_sales_v1', 'item_001', 'ASP-BRK-7075', 'Aluminum 7075 Bracket', 'Aerospace-grade aluminum bracket with AS9100 cert', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_002', 'ASP-TI-HSG', 'Titanium Housing Assembly', 'Ti-6Al-4V housing for satellite components', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_003', 'ASP-COMP-PLT', 'Carbon Composite Plate', 'CNC machined carbon fiber composite plate', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_004', 'ASP-MNT-BLK', 'Mounting Block Assembly', 'Precision mounting block with threaded inserts', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_005', 'ASP-STRUT-TI', 'Titanium Strut', 'Lightweight titanium strut for airframe', 'Part', 'Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes
INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('cnc_aerospace_sales_v1', 'quote_001', 'Q-ASP-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'RFQ-AERO-2025-045'),
  ('cnc_aerospace_sales_v1', 'quote_002', 'Q-ASP-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'SAT-COMP-789'),
  ('cnc_aerospace_sales_v1', 'quote_003', 'Q-ASP-003', 'cust_003', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'DEF-QUOTE-456')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines
INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
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
INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('metal_fab_sales_v1', 'cust_001', 'BuildRight Construction', NULL, NULL, '33-2468135'),
  ('metal_fab_sales_v1', 'cust_002', 'Industrial Steel Solutions', NULL, NULL, '44-1357924'),
  ('metal_fab_sales_v1', 'cust_003', 'Metro Infrastructure Group', NULL, NULL, '55-9876543')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('metal_fab_sales_v1', 'item_001', 'TF-BEAM-W12', 'W12x26 Steel I-Beam', 'Structural steel I-beam, 20ft length', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('metal_fab_sales_v1', 'item_002', 'TF-TRUSS-CUST', 'Custom Steel Truss', 'Welded steel truss assembly per spec', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('metal_fab_sales_v1', 'item_003', 'TF-PLATE-BASE', 'Steel Base Plate', 'Heavy-duty base plate with anchor holes', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('metal_fab_sales_v1', 'item_004', 'TF-RAIL-GUARD', 'Safety Guard Rail', 'Welded steel guard rail system', 'Part', 'Non-Inventory', 'Make', 'FT', TRUE),
  ('metal_fab_sales_v1', 'item_005', 'TF-FRAME-DOOR', 'Steel Door Frame', 'Industrial steel door frame assembly', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes
INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('metal_fab_sales_v1', 'quote_001', 'Q-TF-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'BUILD-2025-789'),
  ('metal_fab_sales_v1', 'quote_002', 'Q-TF-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'IND-STEEL-456'),
  ('metal_fab_sales_v1', 'quote_003', 'Q-TF-003', 'cust_003', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'METRO-INFRA-123')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines
INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
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
INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('auto_precision_sales_v1', 'cust_001', 'Performance Racing Systems', NULL, NULL, '66-1122334'),
  ('auto_precision_sales_v1', 'cust_002', 'Velocity Motorsports', NULL, NULL, '77-4455667'),
  ('auto_precision_sales_v1', 'cust_003', 'Elite Automotive Group', NULL, NULL, '88-7788990')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('auto_precision_sales_v1', 'item_001', 'APX-PISTON-HP', 'High-Performance Piston Set', 'Forged aluminum pistons for racing engines', 'Part', 'Inventory', 'Make', 'SET', TRUE),
  ('auto_precision_sales_v1', 'item_002', 'APX-CRANK-TI', 'Titanium Crankshaft', 'Precision-balanced titanium crankshaft', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('auto_precision_sales_v1', 'item_003', 'APX-VALVE-SS', 'Stainless Valve Set', 'High-temp stainless steel valve set', 'Part', 'Non-Inventory', 'Make', 'SET', TRUE),
  ('auto_precision_sales_v1', 'item_004', 'APX-TURBO-HSG', 'Turbo Housing Assembly', 'CNC machined turbo housing with wastegate', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('auto_precision_sales_v1', 'item_005', 'APX-GEAR-SET', 'Transmission Gear Set', 'Precision-cut transmission gear set', 'Part', 'Inventory', 'Make', 'SET', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes
INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('auto_precision_sales_v1', 'quote_001', 'Q-APX-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'RACE-ENG-2025'),
  ('auto_precision_sales_v1', 'quote_002', 'Q-APX-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'VEL-BUILD-789'),
  ('auto_precision_sales_v1', 'quote_003', 'Q-APX-003', 'cust_003', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'ELITE-PERF-456')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines
INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
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
-- =========================================
-- Demo Seed Data - Parts and Inventory Module Templates
-- =========================================
-- This migration adds template data for Parts and Inventory modules
-- across different industries.

-- =========================================
-- 1) CNC Machining - Parts Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_parts_v1', 'cnc_aerospace', 'Parts', 1, 'cnc_aerospace.parts.v1', 'SkyLine Precision Parts - Parts Demo', 'Demo data for aerospace CNC parts and BOMs', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Parts (finished goods with BOMs)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Finished goods
  ('cnc_aerospace_parts_v1', 'item_fg001', 'FG-BRK-100', 'Aluminum Bracket Assembly', 'Complete bracket assembly with hardware', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_fg002', 'FG-HSG-200', 'Titanium Housing Assembly', 'Complete housing with seals and fasteners', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_fg003', 'FG-SFT-300', 'Shaft Assembly', 'Complete shaft assembly with bearings', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),

  -- Sub-assemblies and components
  ('cnc_aerospace_parts_v1', 'item_sa001', 'SA-BRK-BASE', 'Bracket Base', 'Machined aluminum base component', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_sa002', 'SA-BRK-MOUNT', 'Bracket Mount', 'Machined aluminum mounting component', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_sa003', 'SA-HSG-BODY', 'Housing Body', 'Machined titanium housing body', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_sa004', 'SA-HSG-LID', 'Housing Lid', 'Machined titanium housing lid', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),

  -- Purchased components
  ('cnc_aerospace_parts_v1', 'item_pc001', 'PC-SCREW-M6', 'M6 Socket Head Screw', 'M6x20mm socket head cap screw', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_pc002', 'PC-WASHER-M6', 'M6 Washer', 'M6 flat washer', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_pc003', 'PC-SEAL-001', 'O-Ring Seal 50mm', '50mm diameter Viton O-ring', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_pc004', 'PC-BEARING-001', 'Ball Bearing 6205', '6205 deep groove ball bearing', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts (these link items to their manufacturing details)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('cnc_aerospace_parts_v1', 'item_fg001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_parts_v1', 'item_fg002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_parts_v1', 'item_fg003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_parts_v1', 'item_sa001', TRUE, CURRENT_DATE - INTERVAL '60 days', NULL),
  ('cnc_aerospace_parts_v1', 'item_sa002', TRUE, CURRENT_DATE - INTERVAL '60 days', NULL),
  ('cnc_aerospace_parts_v1', 'item_sa003', TRUE, CURRENT_DATE - INTERVAL '60 days', NULL),
  ('cnc_aerospace_parts_v1', 'item_sa004', TRUE, CURRENT_DATE - INTERVAL '60 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 2) CNC Machining - Inventory Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_inventory_v1', 'cnc_aerospace', 'Inventory', 1, 'cnc_aerospace.inventory.v1', 'SkyLine Precision Parts - Inventory Demo', 'Demo data for aerospace CNC inventory management', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Inventory (raw materials and consumables)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Raw materials
  ('cnc_aerospace_inventory_v1', 'item_rm001', 'RM-AL-6061-1', 'Aluminum 6061 Bar 1" Dia', '1 inch diameter 6061 aluminum bar stock', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_rm002', 'RM-AL-6061-2', 'Aluminum 6061 Bar 2" Dia', '2 inch diameter 6061 aluminum bar stock', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_rm003', 'RM-AL-6061-PLT', 'Aluminum 6061 Plate 0.5"', '0.5 inch thick 6061 aluminum plate', 'Material', 'Non-Inventory', 'Buy', 'SQ FT', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_rm004', 'RM-TI-GR5-1', 'Titanium Grade 5 Bar 1" Dia', '1 inch diameter Ti-6Al-4V bar stock', 'Material', 'Inventory', 'Buy', 'FT', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_rm005', 'RM-TI-GR5-PLT', 'Titanium Grade 5 Plate 0.5"', '0.5 inch thick Ti-6Al-4V plate', 'Material', 'Inventory', 'Buy', 'SQ FT', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_rm006', 'RM-SS-304-1', 'Stainless Steel 304 Bar 1"', '1 inch diameter 304 stainless bar', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_rm007', 'RM-SS-304-2', 'Stainless Steel 304 Bar 2"', '2 inch diameter 304 stainless bar', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),

  -- Tooling and consumables
  ('cnc_aerospace_inventory_v1', 'item_tl001', 'TL-EM-0250', 'Carbide End Mill 1/4"', '1/4" 4-flute carbide end mill', 'Tool', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_tl002', 'TL-EM-0500', 'Carbide End Mill 1/2"', '1/2" 4-flute carbide end mill', 'Tool', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_tl003', 'TL-EM-0750', 'Carbide End Mill 3/4"', '3/4" 4-flute carbide end mill', 'Tool', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_tl004', 'TL-DR-SET-1', 'Drill Bit Set HSS', 'HSS drill bit set 1/16" to 1/2"', 'Tool', 'Non-Inventory', 'Buy', 'SET', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_tl005', 'TL-TAP-M6', 'Tap M6x1.0', 'M6x1.0 spiral point tap', 'Tool', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_tl006', 'TL-TAP-M8', 'Tap M8x1.25', 'M8x1.25 spiral point tap', 'Tool', 'Non-Inventory', 'Buy', 'EA', TRUE),

  -- Consumables
  ('cnc_aerospace_inventory_v1', 'item_cs001', 'CS-COOLANT-5G', 'Cutting Fluid 5 Gallon', 'Synthetic cutting fluid concentrate', 'Consumable', 'Non-Inventory', 'Buy', 'GAL', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_cs002', 'CS-WIPES-BOX', 'Shop Wipes Box', 'Industrial cleaning wipes, 200 count', 'Consumable', 'Non-Inventory', 'Buy', 'BOX', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_cs003', 'CS-GLOVES-L', 'Nitrile Gloves Large', 'Nitrile gloves, large, 100 count', 'Consumable', 'Non-Inventory', 'Buy', 'BOX', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 3) Robotics - Parts Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_parts_v1', 'robotics_oem', 'Parts', 1, 'robotics_oem.parts.v1', 'HumanoTech Robotics - Parts Demo', 'Demo data for humanoid robotics parts and assemblies', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Robotics Parts
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Robot assemblies
  ('robotics_oem_parts_v1', 'item_r001', 'ROB-ARM-6DOF', '6-Axis Robot Arm', 'Complete 6-axis robotic arm assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r002', 'ROB-BASE-001', 'Robot Base Assembly', 'Robot base with mounting plate', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r003', 'ROB-JOINT-1', 'Joint 1 Assembly', 'Base rotation joint assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r004', 'ROB-JOINT-2', 'Joint 2 Assembly', 'Shoulder joint assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r005', 'ROB-JOINT-3', 'Joint 3 Assembly', 'Elbow joint assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),

  -- Sub-components
  ('robotics_oem_parts_v1', 'item_r101', 'ROB-MOTOR-1', 'Servo Motor 1kW', '1kW AC servo motor', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r102', 'ROB-MOTOR-2', 'Servo Motor 2kW', '2kW AC servo motor', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r103', 'ROB-ENCODER-001', 'Absolute Encoder', 'High-resolution absolute encoder', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r104', 'ROB-GEARBOX-001', 'Harmonic Gearbox 100:1', '100:1 ratio harmonic drive gearbox', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r105', 'ROB-CABLE-001', 'Robot Cable Harness', 'Multi-conductor cable harness', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts for Robotics
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('robotics_oem_parts_v1', 'item_r001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_oem_parts_v1', 'item_r002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_oem_parts_v1', 'item_r003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_oem_parts_v1', 'item_r004', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_oem_parts_v1', 'item_r005', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 4) Robotics - Inventory Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_inventory_v1', 'robotics_oem', 'Inventory', 1, 'robotics_oem.inventory.v1', 'HumanoTech Robotics - Inventory Demo', 'Demo data for humanoid robotics inventory management', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Robotics Inventory
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Electronic components
  ('robotics_oem_inventory_v1', 'item_e001', 'EL-PLC-001', 'PLC Controller', 'Industrial PLC with I/O modules', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_e002', 'EL-DRIVE-001', 'Servo Drive 3kW', '3kW servo motor drive', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_e003', 'EL-SENSOR-PROX', 'Proximity Sensor', 'Inductive proximity sensor M18', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_e004', 'EL-SENSOR-VIS', 'Vision Sensor', '2D vision sensor with LED illumination', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_e005', 'EL-RELAY-001', 'Safety Relay Module', 'Dual-channel safety relay', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),

  -- Pneumatic components
  ('robotics_oem_inventory_v1', 'item_p001', 'PN-VALVE-SOL', 'Solenoid Valve 5/2', '5/2 way solenoid valve', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_p002', 'PN-CYL-50', 'Pneumatic Cylinder 50mm', '50mm bore pneumatic cylinder', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_p003', 'PN-GRIP-001', 'Pneumatic Gripper', 'Parallel pneumatic gripper', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_p004', 'PN-FITTING-1/4', 'Push-to-Connect 1/4"', 'Push-to-connect fitting 1/4"', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_p005', 'PN-TUBE-1/4', 'Pneumatic Tubing 1/4"', 'Polyurethane tubing 1/4" OD', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),

  -- Mechanical components
  ('robotics_oem_inventory_v1', 'item_m001', 'MC-BEARING-6205', 'Ball Bearing 6205', '6205 deep groove ball bearing', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_m002', 'MC-BEARING-6305', 'Ball Bearing 6305', '6305 deep groove ball bearing', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_m003', 'MC-BELT-GT2', 'Timing Belt GT2', 'GT2 timing belt 6mm width', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),
  ('robotics_oem_inventory_v1', 'item_m004', 'MC-PULLEY-GT2', 'Timing Pulley GT2 20T', 'GT2 timing pulley 20 teeth', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 5) General Manufacturing - Parts Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fabrication_parts_v1', 'metal_fabrication', 'Parts', 1, 'metal_fabrication.parts.v1', 'TitanFab Industries - Parts Demo', 'Demo data for metal fabrication parts', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for General Parts
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Finished products
  ('metal_fabrication_parts_v1', 'item_g001', 'PROD-001', 'Standard Widget', 'Standard production widget', 'Part', 'Non-Inventory', 'Buy and Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_g002', 'PROD-002', 'Premium Widget', 'Premium quality widget', 'Part', 'Non-Inventory', 'Buy and Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_g003', 'ASSY-001', 'Widget Assembly', 'Complete widget assembly', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),

  -- Components
  ('metal_fabrication_parts_v1', 'item_g101', 'COMP-BASE', 'Widget Base', 'Base component for widget', 'Part', 'Non-Inventory', 'Buy and Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_g102', 'COMP-TOP', 'Widget Top', 'Top component for widget', 'Part', 'Non-Inventory', 'Buy and Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_g103', 'COMP-SPRING', 'Spring Component', 'Spring for widget assembly', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_g104', 'COMP-SCREW', 'Assembly Screw', 'M4x12mm screw for assembly', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts for General Manufacturing
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('metal_fabrication_parts_v1', 'item_g001', TRUE, CURRENT_DATE - INTERVAL '180 days', NULL),
  ('metal_fabrication_parts_v1', 'item_g002', TRUE, CURRENT_DATE - INTERVAL '180 days', NULL),
  ('metal_fabrication_parts_v1', 'item_g003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('metal_fabrication_parts_v1', 'item_g101', TRUE, CURRENT_DATE - INTERVAL '180 days', NULL),
  ('metal_fabrication_parts_v1', 'item_g102', TRUE, CURRENT_DATE - INTERVAL '180 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 6) General Manufacturing - Inventory Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fabrication_inventory_v1', 'metal_fabrication', 'Inventory', 1, 'metal_fabrication.inventory.v1', 'TitanFab Industries - Inventory Demo', 'Demo data for metal fabrication inventory', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for General Inventory
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Raw materials
  ('metal_fabrication_inventory_v1', 'item_rm001', 'RM-STEEL-SHEET', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Material', 'Non-Inventory', 'Buy', 'SQ FT', TRUE),
  ('metal_fabrication_inventory_v1', 'item_rm002', 'RM-PLASTIC-ABS', 'ABS Plastic Sheet', '1/8" ABS plastic sheet', 'Material', 'Non-Inventory', 'Buy', 'SQ FT', TRUE),
  ('metal_fabrication_inventory_v1', 'item_rm003', 'RM-WOOD-PLY', 'Plywood 3/4"', '3/4" birch plywood', 'Material', 'Non-Inventory', 'Buy', 'SQ FT', TRUE),

  -- Hardware
  ('metal_fabrication_inventory_v1', 'item_hw001', 'HW-SCREW-M4', 'M4x12mm Screw', 'M4x12mm pan head screw', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_hw002', 'HW-SCREW-M6', 'M6x20mm Screw', 'M6x20mm socket head screw', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_hw003', 'HW-NUT-M4', 'M4 Hex Nut', 'M4 hex nut', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_hw004', 'HW-NUT-M6', 'M6 Hex Nut', 'M6 hex nut', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_hw005', 'HW-WASHER-M6', 'M6 Flat Washer', 'M6 flat washer', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),

  -- Packaging
  ('metal_fabrication_inventory_v1', 'item_pk001', 'PK-BOX-SM', 'Small Shipping Box', 'Small corrugated shipping box', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_pk002', 'PK-BOX-MD', 'Medium Shipping Box', 'Medium corrugated shipping box', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_pk003', 'PK-TAPE', 'Packing Tape', '2" packing tape roll', 'Consumable', 'Non-Inventory', 'Buy', 'ROLL', TRUE),
  ('metal_fabrication_inventory_v1', 'item_pk004', 'PK-BUBBLE', 'Bubble Wrap', 'Bubble wrap roll 12" wide', 'Consumable', 'Non-Inventory', 'Buy', 'FT', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 7) Purchasing Module Templates for All Industries
-- =========================================

-- =========================================
-- 7a) Robotics OEM - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_purchasing_v1', 'robotics_oem', 'Purchasing', 1, 'robotics_oem.purchasing.v1', 'HumanoTech Robotics Purchasing Demo', 'Demo data for humanoid robot manufacturing purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Suppliers
INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('robotics_oem_purchasing_v1', 'supp_001', 'Precision Motors Inc', NULL, NULL, '12-3456789'),
  ('robotics_oem_purchasing_v1', 'supp_002', 'Advanced Electronics Supply', NULL, NULL, '23-4567890'),
  ('robotics_oem_purchasing_v1', 'supp_003', 'Robotic Components Co', NULL, NULL, '34-5678901')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items (materials/components for purchasing)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('robotics_oem_purchasing_v1', 'item_001', 'MAT-SERVO-1KW', 'Servo Motor 1kW', '1kW AC servo motor for robot joints', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'item_002', 'MAT-ENCODER-ABS', 'Absolute Encoder', 'High-resolution absolute encoder', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'item_003', 'MAT-GEARBOX-100', 'Harmonic Gearbox 100:1', '100:1 ratio harmonic drive', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'item_004', 'MAT-BEARING-6205', 'Ball Bearing 6205', '6205 deep groove ball bearing', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'item_005', 'MAT-CABLE-HARN', 'Robot Cable Harness', 'Multi-conductor cable harness', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Orders
INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('robotics_oem_purchasing_v1', 'po_001', 'PO-2025-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'po_002', 'PO-2025-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days'),
  ('robotics_oem_purchasing_v1', 'po_003', 'PO-2025-003', 'supp_003', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '15 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Order Lines
INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('robotics_oem_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Servo Motor 1kW - Standard', 20, 850.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Absolute Encoder - High Res', 20, 450.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Harmonic Gearbox 100:1', 15, 1250.00, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days'),
  ('robotics_oem_purchasing_v1', 'poline_004', 'po_002', 'item_004', 'Ball Bearing 6205', 100, 12.50, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days'),
  ('robotics_oem_purchasing_v1', 'poline_005', 'po_003', 'item_005', 'Robot Cable Harness', 25, 185.00, CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '15 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 7b) CNC Aerospace - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_purchasing_v1', 'cnc_aerospace', 'Purchasing', 1, 'cnc_aerospace.purchasing.v1', 'SkyLine Precision Parts Purchasing Demo', 'Demo data for aerospace CNC purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Suppliers
INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('cnc_aerospace_purchasing_v1', 'supp_001', 'Aerospace Metals Supply', NULL, NULL, '11-2233445'),
  ('cnc_aerospace_purchasing_v1', 'supp_002', 'Precision Tooling Co', NULL, NULL, '22-3344556'),
  ('cnc_aerospace_purchasing_v1', 'supp_003', 'Aerospace Fasteners Inc', NULL, NULL, '33-4455667')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('cnc_aerospace_purchasing_v1', 'item_001', 'MAT-AL-6061-BAR', 'Aluminum 6061 Bar 2"', '2 inch diameter 6061 aluminum bar stock', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_002', 'MAT-TI-GR5-BAR', 'Titanium Grade 5 Bar 1"', '1 inch diameter Ti-6Al-4V bar stock', 'Material', 'Inventory', 'Buy', 'FT', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_003', 'MAT-EM-1/2', 'Carbide End Mill 1/2"', '1/2" 4-flute carbide end mill', 'Tool', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_004', 'MAT-SCREW-M6', 'M6 Socket Head Screw', 'M6x20mm socket head cap screw', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_005', 'MAT-SEAL-50MM', 'O-Ring Seal 50mm', '50mm diameter Viton O-ring', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Orders
INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('cnc_aerospace_purchasing_v1', 'po_001', 'PO-ASP-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'po_002', 'PO-ASP-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '18 days'),
  ('cnc_aerospace_purchasing_v1', 'po_003', 'PO-ASP-003', 'supp_003', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE + INTERVAL '8 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Order Lines
INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('cnc_aerospace_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Aluminum 6061 Bar 2" - Aerospace Grade', 500, 8.50, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Titanium Grade 5 Bar 1"', 200, 45.00, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Carbide End Mill 1/2" - Premium', 25, 125.00, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '18 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_004', 'po_003', 'item_004', 'M6 Socket Head Screw - AS9100', 500, 0.85, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE + INTERVAL '8 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_005', 'po_003', 'item_005', 'O-Ring Seal 50mm - Viton', 100, 3.25, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE + INTERVAL '8 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 7c) Metal Fabrication - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fabrication_purchasing_v1', 'metal_fabrication', 'Purchasing', 1, 'metal_fabrication.purchasing.v1', 'TitanFab Industries Purchasing Demo', 'Demo data for metal fabrication purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Suppliers
INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('metal_fabrication_purchasing_v1', 'supp_001', 'Steel Supply Co', NULL, NULL, '44-5566778'),
  ('metal_fabrication_purchasing_v1', 'supp_002', 'Industrial Hardware Supply', NULL, NULL, '55-6677889'),
  ('metal_fabrication_purchasing_v1', 'supp_003', 'Welding Supplies Inc', NULL, NULL, '66-7788990')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('metal_fabrication_purchasing_v1', 'item_001', 'MAT-STEEL-SHEET-16GA', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Material', 'Non-Inventory', 'Buy', 'SQ FT', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_002', 'MAT-STEEL-BEAM-W12', 'W12x26 Steel I-Beam', 'W12x26 structural steel I-beam', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_003', 'MAT-SCREW-M6', 'M6x20mm Screw', 'M6x20mm socket head screw', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_004', 'MAT-WELD-ROD-7018', 'Welding Rod 7018', '7018 welding electrode', 'Consumable', 'Non-Inventory', 'Buy', 'LB', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_005', 'MAT-PAINT-PRIMER', 'Primer Paint', 'Rust-inhibiting primer paint', 'Consumable', 'Non-Inventory', 'Buy', 'GAL', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Orders
INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('metal_fabrication_purchasing_v1', 'po_001', 'PO-TF-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '7 days'),
  ('metal_fabrication_purchasing_v1', 'po_002', 'PO-TF-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '12 days'),
  ('metal_fabrication_purchasing_v1', 'po_003', 'PO-TF-003', 'supp_003', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '8 days', CURRENT_DATE + INTERVAL '5 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Order Lines
INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('metal_fabrication_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Steel Sheet 16GA - Cold Rolled', 2000, 2.85, CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '7 days'),
  ('metal_fabrication_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'W12x26 Steel I-Beam - 20ft', 50, 285.00, CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '7 days'),
  ('metal_fabrication_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'M6x20mm Screw - Socket Head', 1000, 0.35, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '12 days'),
  ('metal_fabrication_purchasing_v1', 'poline_004', 'po_003', 'item_004', 'Welding Rod 7018 - 50lb', 200, 4.25, CURRENT_DATE + INTERVAL '8 days', CURRENT_DATE + INTERVAL '5 days'),
  ('metal_fabrication_purchasing_v1', 'poline_005', 'po_003', 'item_005', 'Primer Paint - Rust Inhibiting', 20, 45.00, CURRENT_DATE + INTERVAL '8 days', CURRENT_DATE + INTERVAL '5 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 7d) Automotive Precision - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('automotive_precision_purchasing_v1', 'automotive_precision', 'Purchasing', 1, 'automotive_precision.purchasing.v1', 'Apex Motors Engineering Purchasing Demo', 'Demo data for automotive precision purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Suppliers
INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('automotive_precision_purchasing_v1', 'supp_001', 'Precision Metals Supply', NULL, NULL, '77-8899001'),
  ('automotive_precision_purchasing_v1', 'supp_002', 'Racing Components Inc', NULL, NULL, '88-9900112'),
  ('automotive_precision_purchasing_v1', 'supp_003', 'Performance Fasteners Co', NULL, NULL, '99-0011223')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('automotive_precision_purchasing_v1', 'item_001', 'MAT-AL-FORGED-BLK', 'Forged Aluminum Blank', 'Forged aluminum blank for pistons', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'item_002', 'MAT-TI-BAR-1', 'Titanium Bar 1"', '1 inch diameter titanium bar for crankshaft', 'Material', 'Inventory', 'Buy', 'FT', TRUE),
  ('automotive_precision_purchasing_v1', 'item_003', 'MAT-SS-VALVE', 'Stainless Valve Blank', 'Stainless steel valve blank', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'item_004', 'MAT-TURBO-HSG-BLK', 'Turbo Housing Blank', 'CNC-ready turbo housing blank', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'item_005', 'MAT-GEAR-STEEL', 'Gear Steel Bar', 'High-grade gear steel bar stock', 'Material', 'Inventory', 'Buy', 'FT', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Orders
INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('automotive_precision_purchasing_v1', 'po_001', 'PO-APX-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'po_002', 'PO-APX-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '18 days'),
  ('automotive_precision_purchasing_v1', 'po_003', 'PO-APX-003', 'supp_003', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '4 days', CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE + INTERVAL '8 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Order Lines
INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('automotive_precision_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Forged Aluminum Blank - Racing Grade', 50, 125.00, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Titanium Bar 1" - High Grade', 100, 85.00, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Stainless Valve Blank - High Temp', 200, 8.50, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '18 days'),
  ('automotive_precision_purchasing_v1', 'poline_004', 'po_002', 'item_004', 'Turbo Housing Blank - Precision', 25, 450.00, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '18 days'),
  ('automotive_precision_purchasing_v1', 'poline_005', 'po_003', 'item_005', 'Gear Steel Bar - Premium Grade', 150, 12.50, CURRENT_DATE + INTERVAL '12 days', CURRENT_DATE + INTERVAL '8 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- Summary of Template Sets Created
-- =========================================
-- CNC Machining:
--   - cnc_aerospace.parts.v1: 11 items (finished goods, sub-assemblies, purchased), 7 parts
--   - cnc_aerospace.inventory.v1: 16 items (raw materials, tooling, consumables)
--   - cnc_aerospace.purchasing.v1: 3 suppliers, 5 items, 3 purchase orders, 5 purchase order lines
-- Robotics:
--   - robotics_oem.parts.v1: 10 items (robot assemblies and components), 5 parts
--   - robotics_oem.inventory.v1: 14 items (electronic, pneumatic, mechanical components)
--   - robotics_oem.purchasing.v1: 3 suppliers, 5 items, 3 purchase orders, 5 purchase order lines
-- Metal Fabrication:
--   - metal_fabrication.parts.v1: 7 items (products and components), 5 parts
--   - metal_fabrication.inventory.v1: 13 items (raw materials, hardware, packaging)
--   - metal_fabrication.purchasing.v1: 3 suppliers, 5 items, 3 purchase orders, 5 purchase order lines
-- Automotive Precision:
--   - automotive_precision.purchasing.v1: 3 suppliers, 5 items, 3 purchase orders, 5 purchase order lines
