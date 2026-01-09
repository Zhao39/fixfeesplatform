-- =========================================
-- Demo Seed Data - Standardized Templates for All Industries
-- =========================================
-- This migration creates demo templates for the 4 industries with IDENTICAL structure.
-- Each industry has the same record counts and data structure, only names/descriptions differ.
--
-- STRUCTURE PER INDUSTRY:
--   Sales Module: 3 customers, 3 items, 2 quotes, 3 quote lines
--   Parts Module: 6 items (3 assemblies + 3 components), 3 parts
--   Inventory Module: 6 items (3 + 3), 6 parts
--   Purchasing Module: 3 suppliers, 3 items, 2 POs, 3 PO lines

-- =========================================
-- 1) HumanoTech Robotics (Robotics OEM) - Sales Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_sales_v1', 'robotics_oem', 'Sales', 1, 'robotics_oem.sales.v1', 'HumanoTech Robotics Sales Demo', 'Demo data for humanoid robot manufacturing sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('robotics_oem_sales_v1', 'cust_001', 'SmartFactory Automation', NULL, NULL, '45-1234567'),
  ('robotics_oem_sales_v1', 'cust_002', 'Global Logistics Corp', NULL, NULL, '78-9876543'),
  ('robotics_oem_sales_v1', 'cust_003', 'Healthcare Robotics Solutions', NULL, NULL, '23-4567890')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('robotics_oem_sales_v1', 'item_001', 'HUM-R1', 'HumanoBot R1', 'Entry-level humanoid robot for warehouse automation', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_002', 'HUM-R2-PRO', 'HumanoBot R2 Pro', 'Advanced humanoid robot with AI vision system', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_003', 'HUM-ARM-KIT', 'Dual Arm Upgrade Kit', 'Precision dual-arm manipulation system', 'Part', 'Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Part records for Sales module items (required for Part-type items to be accessible)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('robotics_oem_sales_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_oem_sales_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_oem_sales_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('robotics_oem_sales_v1', 'quote_001', 'Q-2025-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('robotics_oem_sales_v1', 'quote_002', 'Q-2025-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-002')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('robotics_oem_sales_v1', 'qline_001', 'quote_001', 'item_001', 'HumanoBot R1 - Standard Config', 5, 85000.00),
  ('robotics_oem_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Dual Arm Upgrade Kit', 5, 35000.00),
  ('robotics_oem_sales_v1', 'qline_003', 'quote_002', 'item_002', 'HumanoBot R2 Pro - Full AI Suite', 3, 145000.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 2) SkyLine Precision Parts (CNC Aerospace) - Sales Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_sales_v1', 'cnc_aerospace', 'Sales', 1, 'cnc_aerospace.sales.v1', 'SkyLine Precision Parts Sales Demo', 'Demo data for aerospace CNC machining sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('cnc_aerospace_sales_v1', 'cust_001', 'AeroSpace Dynamics', NULL, NULL, '12-3456789'),
  ('cnc_aerospace_sales_v1', 'cust_002', 'Satellite Systems Inc', NULL, NULL, '98-7654321'),
  ('cnc_aerospace_sales_v1', 'cust_003', 'Defense Aviation Corp', NULL, NULL, '45-6789012')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('cnc_aerospace_sales_v1', 'item_001', 'ASP-BRK-7075', 'Aluminum 7075 Bracket', 'Aerospace-grade aluminum bracket with AS9100 cert', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_002', 'ASP-TI-HSG', 'Titanium Housing Assembly', 'Ti-6Al-4V housing for satellite components', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_003', 'ASP-COMP-PLT', 'Carbon Composite Plate', 'CNC machined carbon fiber composite plate', 'Part', 'Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Part records for Sales module items (required for Part-type items to be accessible)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('cnc_aerospace_sales_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('cnc_aerospace_sales_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('cnc_aerospace_sales_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('cnc_aerospace_sales_v1', 'quote_001', 'Q-ASP-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('cnc_aerospace_sales_v1', 'quote_002', 'Q-ASP-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-002')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('cnc_aerospace_sales_v1', 'qline_001', 'quote_001', 'item_001', 'Aluminum 7075 Bracket - AS9100 Certified', 250, 125.00),
  ('cnc_aerospace_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Carbon Composite Plate', 100, 450.00),
  ('cnc_aerospace_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Titanium Housing Assembly - Satellite Grade', 50, 875.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 3) TitanFab Industries (Metal Fabrication) - Sales Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fab_sales_v1', 'metal_fabrication', 'Sales', 1, 'metal_fabrication.sales.v1', 'TitanFab Industries Sales Demo', 'Demo data for structural metal fabrication sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('metal_fab_sales_v1', 'cust_001', 'BuildRight Construction', NULL, NULL, '33-2468135'),
  ('metal_fab_sales_v1', 'cust_002', 'Industrial Steel Solutions', NULL, NULL, '44-1357924'),
  ('metal_fab_sales_v1', 'cust_003', 'Metro Infrastructure Group', NULL, NULL, '55-9876543')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('metal_fab_sales_v1', 'item_001', 'TF-BEAM-W12', 'W12x26 Steel I-Beam', 'Structural steel I-beam, 20ft length', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fab_sales_v1', 'item_002', 'TF-TRUSS-CUST', 'Custom Steel Truss', 'Welded steel truss assembly per spec', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fab_sales_v1', 'item_003', 'TF-PLATE-BASE', 'Steel Base Plate', 'Heavy-duty base plate with anchor holes', 'Part', 'Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Part records for Sales module items (required for Part-type items to be accessible)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('metal_fab_sales_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('metal_fab_sales_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('metal_fab_sales_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('metal_fab_sales_v1', 'quote_001', 'Q-TF-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('metal_fab_sales_v1', 'quote_002', 'Q-TF-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-002')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('metal_fab_sales_v1', 'qline_001', 'quote_001', 'item_001', 'W12x26 Steel I-Beam - 20ft', 50, 285.00),
  ('metal_fab_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Steel Base Plate - Heavy Duty', 50, 125.00),
  ('metal_fab_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Custom Steel Truss - Per Drawing', 12, 1850.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 4) Apex Motors Engineering (Automotive Precision) - Sales Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('auto_precision_sales_v1', 'automotive_precision', 'Sales', 1, 'automotive_precision.sales.v1', 'Apex Motors Engineering Sales Demo', 'Demo data for high-performance automotive parts sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('auto_precision_sales_v1', 'cust_001', 'Performance Racing Systems', NULL, NULL, '66-1122334'),
  ('auto_precision_sales_v1', 'cust_002', 'Velocity Motorsports', NULL, NULL, '77-4455667'),
  ('auto_precision_sales_v1', 'cust_003', 'Elite Automotive Group', NULL, NULL, '88-7788990')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('auto_precision_sales_v1', 'item_001', 'APX-PISTON-HP', 'High-Performance Piston Set', 'Forged aluminum pistons for racing engines', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('auto_precision_sales_v1', 'item_002', 'APX-CRANK-TI', 'Titanium Crankshaft', 'Precision-balanced titanium crankshaft', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('auto_precision_sales_v1', 'item_003', 'APX-VALVE-SS', 'Stainless Valve Set', 'High-temp stainless steel valve set', 'Part', 'Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Part records for Sales module items (required for Part-type items to be accessible)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('auto_precision_sales_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('auto_precision_sales_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('auto_precision_sales_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('auto_precision_sales_v1', 'quote_001', 'Q-APX-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('auto_precision_sales_v1', 'quote_002', 'Q-APX-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-002')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('auto_precision_sales_v1', 'qline_001', 'quote_001', 'item_001', 'High-Performance Piston Set - Racing Spec', 10, 2850.00),
  ('auto_precision_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Stainless Valve Set - High Temp', 10, 1250.00),
  ('auto_precision_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Titanium Crankshaft - Balanced', 5, 8500.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- PARTS MODULE - ALL INDUSTRIES (Standardized: 6 items, 3 parts)
-- =========================================

-- =========================================
-- 1) Robotics OEM - Parts Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_parts_v1', 'robotics_oem', 'Parts', 1, 'robotics_oem.parts.v1', 'HumanoTech Robotics - Parts Demo', 'Demo data for humanoid robotics parts and assemblies', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('robotics_oem_parts_v1', 'item_a001', 'ROB-ARM-6DOF', '6-Axis Robot Arm', 'Complete 6-axis robotic arm assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_a002', 'ROB-BASE-001', 'Robot Base Assembly', 'Robot base with mounting plate', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_a003', 'ROB-JOINT-1', 'Joint 1 Assembly', 'Base rotation joint assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_c001', 'ROB-MOTOR-1', 'Servo Motor 1kW', '1kW AC servo motor', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_c002', 'ROB-ENCODER-001', 'Absolute Encoder', 'High-resolution absolute encoder', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_c003', 'ROB-GEARBOX-001', 'Harmonic Gearbox 100:1', '100:1 ratio harmonic drive gearbox', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('robotics_oem_parts_v1', 'item_a001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_oem_parts_v1', 'item_a002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_oem_parts_v1', 'item_a003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 2) CNC Aerospace - Parts Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_parts_v1', 'cnc_aerospace', 'Parts', 1, 'cnc_aerospace.parts.v1', 'SkyLine Precision Parts - Parts Demo', 'Demo data for aerospace CNC parts and BOMs', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('cnc_aerospace_parts_v1', 'item_a001', 'FG-BRK-100', 'Aluminum Bracket Assembly', 'Complete bracket assembly with hardware', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_a002', 'FG-HSG-200', 'Titanium Housing Assembly', 'Complete housing with seals and fasteners', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_a003', 'FG-SFT-300', 'Shaft Assembly', 'Complete shaft assembly with bearings', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_c001', 'PC-SCREW-M6', 'M6 Socket Head Screw', 'M6x20mm socket head cap screw', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_c002', 'PC-WASHER-M6', 'M6 Washer', 'M6 flat washer', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_c003', 'PC-SEAL-001', 'O-Ring Seal 50mm', '50mm diameter Viton O-ring', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('cnc_aerospace_parts_v1', 'item_a001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('cnc_aerospace_parts_v1', 'item_a002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('cnc_aerospace_parts_v1', 'item_a003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 3) Metal Fabrication - Parts Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fabrication_parts_v1', 'metal_fabrication', 'Parts', 1, 'metal_fabrication.parts.v1', 'TitanFab Industries - Parts Demo', 'Demo data for metal fabrication parts', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('metal_fabrication_parts_v1', 'item_a001', 'PROD-001', 'Standard Widget', 'Standard production widget', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_a002', 'PROD-002', 'Premium Widget', 'Premium quality widget', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_a003', 'ASSY-001', 'Widget Assembly', 'Complete widget assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_c001', 'COMP-BASE', 'Widget Base', 'Base component for widget', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_c002', 'COMP-TOP', 'Widget Top', 'Top component for widget', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_c003', 'COMP-SPRING', 'Spring Component', 'Spring for widget assembly', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('metal_fabrication_parts_v1', 'item_a001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('metal_fabrication_parts_v1', 'item_a002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('metal_fabrication_parts_v1', 'item_a003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 4) Automotive Precision - Parts Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('automotive_precision_parts_v1', 'automotive_precision', 'Parts', 1, 'automotive_precision.parts.v1', 'Apex Motors Engineering - Parts Demo', 'Demo data for automotive precision parts and assemblies', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('automotive_precision_parts_v1', 'item_a001', 'ENG-PISTON-ASY', 'Piston Assembly', 'Complete piston assembly with rings and pin', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_a002', 'ENG-CRANK-ASY', 'Crankshaft Assembly', 'Balanced crankshaft with bearings', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_a003', 'ENG-VALVE-ASY', 'Valve Train Assembly', 'Complete valve train assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_c001', 'CMP-RING-SET', 'Piston Ring Set', 'High-performance piston ring set', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_c002', 'CMP-BEARING-RD', 'Rod Bearing Set', 'Connecting rod bearing set', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_c003', 'CMP-SPRING-VLV', 'Valve Spring Set', 'High-lift valve spring set', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('automotive_precision_parts_v1', 'item_a001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('automotive_precision_parts_v1', 'item_a002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('automotive_precision_parts_v1', 'item_a003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- INVENTORY MODULE - ALL INDUSTRIES (Standardized: 6 items, 6 parts)
-- =========================================

-- =========================================
-- 1) Robotics OEM - Inventory Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_inventory_v1', 'robotics_oem', 'Inventory', 1, 'robotics_oem.inventory.v1', 'HumanoTech Robotics - Inventory Demo', 'Demo data for humanoid robotics inventory management', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('robotics_oem_inventory_v1', 'item_i001', 'EL-PLC-001', 'PLC Controller', 'Industrial PLC with I/O modules', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_i002', 'EL-DRIVE-001', 'Servo Drive 3kW', '3kW servo motor drive', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_i003', 'EL-SENSOR-VIS', 'Vision Sensor', '2D vision sensor with LED illumination', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_i004', 'MC-BEARING-6205', 'Ball Bearing 6205', '6205 deep groove ball bearing', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_i005', 'MC-BELT-GT2', 'Timing Belt GT2', 'GT2 timing belt 6mm width', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_i006', 'MC-PULLEY-GT2', 'Timing Pulley GT2 20T', 'GT2 timing pulley 20 teeth', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('robotics_oem_inventory_v1', 'item_i001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_inventory_v1', 'item_i002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_inventory_v1', 'item_i003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_inventory_v1', 'item_i004', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_inventory_v1', 'item_i005', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_inventory_v1', 'item_i006', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 2) CNC Aerospace - Inventory Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_inventory_v1', 'cnc_aerospace', 'Inventory', 1, 'cnc_aerospace.inventory.v1', 'SkyLine Precision Parts - Inventory Demo', 'Demo data for aerospace CNC inventory management', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('cnc_aerospace_inventory_v1', 'item_i001', 'RM-AL-6061-1', 'Aluminum 6061 Bar 1" Dia', '1 inch diameter 6061 aluminum bar stock', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i002', 'RM-TI-GR5-1', 'Titanium Grade 5 Bar 1" Dia', '1 inch diameter Ti-6Al-4V bar stock', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i003', 'RM-SS-304-1', 'Stainless Steel 304 Bar 1"', '1 inch diameter 304 stainless bar', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i004', 'TL-EM-0250', 'Carbide End Mill 1/4"', '1/4" 4-flute carbide end mill', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i005', 'TL-EM-0500', 'Carbide End Mill 1/2"', '1/2" 4-flute carbide end mill', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i006', 'TL-DR-SET-1', 'Drill Bit Set HSS', 'HSS drill bit set 1/16" to 1/2"', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('cnc_aerospace_inventory_v1', 'item_i001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_inventory_v1', 'item_i002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_inventory_v1', 'item_i003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_inventory_v1', 'item_i004', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_inventory_v1', 'item_i005', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_inventory_v1', 'item_i006', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 3) Metal Fabrication - Inventory Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fabrication_inventory_v1', 'metal_fabrication', 'Inventory', 1, 'metal_fabrication.inventory.v1', 'TitanFab Industries - Inventory Demo', 'Demo data for metal fabrication inventory', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('metal_fabrication_inventory_v1', 'item_i001', 'RM-STEEL-SHEET', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i002', 'RM-PLASTIC-ABS', 'ABS Plastic Sheet', '1/8" ABS plastic sheet', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i003', 'RM-WOOD-PLY', 'Plywood 3/4"', '3/4" birch plywood', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i004', 'HW-SCREW-M4', 'M4x12mm Screw', 'M4x12mm pan head screw', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i005', 'HW-SCREW-M6', 'M6x20mm Screw', 'M6x20mm socket head screw', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i006', 'HW-NUT-M6', 'M6 Hex Nut', 'M6 hex nut', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('metal_fabrication_inventory_v1', 'item_i001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_inventory_v1', 'item_i002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_inventory_v1', 'item_i003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_inventory_v1', 'item_i004', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_inventory_v1', 'item_i005', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_inventory_v1', 'item_i006', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 4) Automotive Precision - Inventory Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('automotive_precision_inventory_v1', 'automotive_precision', 'Inventory', 1, 'automotive_precision.inventory.v1', 'Apex Motors Engineering - Inventory Demo', 'Demo data for automotive precision inventory management', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('automotive_precision_inventory_v1', 'item_i001', 'INV-GASKET-HD', 'Head Gasket Set', 'Multi-layer steel head gasket set', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i002', 'INV-SEAL-CRK', 'Crankshaft Seal Kit', 'Complete crankshaft seal kit', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i003', 'INV-BOLT-HEAD', 'Head Bolt Set', 'High-strength head bolt set', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i004', 'INV-STUD-EXH', 'Exhaust Stud Kit', 'Stainless exhaust manifold stud kit', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i005', 'INV-DOWEL-PIN', 'Dowel Pin Set', 'Precision dowel pin set', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i006', 'INV-WASHER-TH', 'Thrust Washer Set', 'Crankshaft thrust washer set', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('automotive_precision_inventory_v1', 'item_i001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('automotive_precision_inventory_v1', 'item_i002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('automotive_precision_inventory_v1', 'item_i003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('automotive_precision_inventory_v1', 'item_i004', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('automotive_precision_inventory_v1', 'item_i005', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('automotive_precision_inventory_v1', 'item_i006', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- PURCHASING MODULE - ALL INDUSTRIES (Standardized: 3 suppliers, 3 items, 2 POs, 3 PO lines)
-- =========================================

-- =========================================
-- 1) Robotics OEM - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_purchasing_v1', 'robotics_oem', 'Purchasing', 1, 'robotics_oem.purchasing.v1', 'HumanoTech Robotics Purchasing Demo', 'Demo data for humanoid robot manufacturing purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('robotics_oem_purchasing_v1', 'supp_001', 'Precision Motors Inc', NULL, NULL, '12-3456789'),
  ('robotics_oem_purchasing_v1', 'supp_002', 'Advanced Electronics Supply', NULL, NULL, '23-4567890'),
  ('robotics_oem_purchasing_v1', 'supp_003', 'Robotic Components Co', NULL, NULL, '34-5678901')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('robotics_oem_purchasing_v1', 'item_001', 'PRT-SERVO-1KW', 'Servo Motor 1kW', '1kW AC servo motor for robot joints', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'item_002', 'PRT-ENCODER-ABS', 'Absolute Encoder', 'High-resolution absolute encoder', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'item_003', 'PRT-GEARBOX-100', 'Harmonic Gearbox 100:1', '100:1 ratio harmonic drive', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Part records for Purchasing module items (required for Part-type items to be accessible)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('robotics_oem_purchasing_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_purchasing_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_purchasing_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('robotics_oem_purchasing_v1', 'po_001', 'PO-2025-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'po_002', 'PO-2025-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('robotics_oem_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Servo Motor 1kW - Standard', 20, 850.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Absolute Encoder - High Res', 20, 450.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Harmonic Gearbox 100:1', 15, 1250.00, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 2) CNC Aerospace - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_purchasing_v1', 'cnc_aerospace', 'Purchasing', 1, 'cnc_aerospace.purchasing.v1', 'SkyLine Precision Parts Purchasing Demo', 'Demo data for aerospace CNC purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('cnc_aerospace_purchasing_v1', 'supp_001', 'Aerospace Metals Supply', NULL, NULL, '11-2233445'),
  ('cnc_aerospace_purchasing_v1', 'supp_002', 'Precision Tooling Co', NULL, NULL, '22-3344556'),
  ('cnc_aerospace_purchasing_v1', 'supp_003', 'Aerospace Fasteners Inc', NULL, NULL, '33-4455667')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('cnc_aerospace_purchasing_v1', 'item_001', 'PRT-AL-6061-BAR', 'Aluminum 6061 Bar 2"', '2 inch diameter 6061 aluminum bar stock', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_002', 'PRT-TI-GR5-BAR', 'Titanium Grade 5 Bar 1"', '1 inch diameter Ti-6Al-4V bar stock', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_003', 'PRT-EM-CARB', 'Carbide End Mill 1/2"', '1/2" 4-flute carbide end mill', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Part records for Purchasing module items (required for Part-type items to be accessible)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('cnc_aerospace_purchasing_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_purchasing_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_purchasing_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('cnc_aerospace_purchasing_v1', 'po_001', 'PO-ASP-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'po_002', 'PO-ASP-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('cnc_aerospace_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Aluminum 6061 Bar 2" - Aerospace Grade', 500, 8.50, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Titanium Grade 5 Bar 1"', 200, 45.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Carbide End Mill 1/2" - Premium', 25, 125.00, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 3) Metal Fabrication - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fabrication_purchasing_v1', 'metal_fabrication', 'Purchasing', 1, 'metal_fabrication.purchasing.v1', 'TitanFab Industries Purchasing Demo', 'Demo data for metal fabrication purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('metal_fabrication_purchasing_v1', 'supp_001', 'Steel Supply Co', NULL, NULL, '44-5566778'),
  ('metal_fabrication_purchasing_v1', 'supp_002', 'Industrial Hardware Supply', NULL, NULL, '55-6677889'),
  ('metal_fabrication_purchasing_v1', 'supp_003', 'Welding Supplies Inc', NULL, NULL, '66-7788990')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('metal_fabrication_purchasing_v1', 'item_001', 'PRT-STEEL-SHEET', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_002', 'PRT-STEEL-BEAM', 'W12x26 Steel I-Beam', 'W12x26 structural steel I-beam', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_003', 'PRT-WELD-ROD', 'Welding Rod 7018', '7018 welding electrode', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Part records for Purchasing module items (required for Part-type items to be accessible)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('metal_fabrication_purchasing_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_purchasing_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_purchasing_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('metal_fabrication_purchasing_v1', 'po_001', 'PO-TF-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('metal_fabrication_purchasing_v1', 'po_002', 'PO-TF-002', 'supp_003', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('metal_fabrication_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Steel Sheet 16GA - Cold Rolled', 2000, 2.85, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('metal_fabrication_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'W12x26 Steel I-Beam - 20ft', 50, 285.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('metal_fabrication_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Welding Rod 7018 - 50lb', 200, 4.25, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 4) Automotive Precision - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('automotive_precision_purchasing_v1', 'automotive_precision', 'Purchasing', 1, 'automotive_precision.purchasing.v1', 'Apex Motors Engineering Purchasing Demo', 'Demo data for automotive precision purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('automotive_precision_purchasing_v1', 'supp_001', 'Precision Metals Supply', NULL, NULL, '77-8899001'),
  ('automotive_precision_purchasing_v1', 'supp_002', 'Racing Components Inc', NULL, NULL, '88-9900112'),
  ('automotive_precision_purchasing_v1', 'supp_003', 'Performance Fasteners Co', NULL, NULL, '99-0011223')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('automotive_precision_purchasing_v1', 'item_001', 'PRT-AL-FORGED', 'Forged Aluminum Blank', 'Forged aluminum blank for pistons', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'item_002', 'PRT-TI-BAR', 'Titanium Bar 1"', '1 inch diameter titanium bar for crankshaft', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'item_003', 'PRT-SS-VALVE', 'Stainless Valve Blank', 'Stainless steel valve blank', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Part records for Purchasing module items (required for Part-type items to be accessible)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('automotive_precision_purchasing_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('automotive_precision_purchasing_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('automotive_precision_purchasing_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('automotive_precision_purchasing_v1', 'po_001', 'PO-APX-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'po_002', 'PO-APX-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('automotive_precision_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Forged Aluminum Blank - Racing Grade', 50, 125.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Titanium Bar 1" - High Grade', 100, 85.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Stainless Valve Blank - High Temp', 200, 8.50, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- STANDARDIZED STRUCTURE SUMMARY
-- =========================================
-- Each industry now has identical structure:
--
-- Sales Module (per industry):
--   - 3 customers (cust_001, cust_002, cust_003)
--   - 3 items (item_001, item_002, item_003) - all Part type, Inventory tracking, Make
--   - 3 parts (for the 3 items) - required for items to be accessible
--   - 2 quotes (quote_001, quote_002)
--   - 3 quote lines (qline_001, qline_002, qline_003)
--
-- Parts Module (per industry):
--   - 6 items (item_a001-a003 assemblies, item_c001-c003 components) - all Part type
--   - 3 parts (for assemblies)
--
-- Inventory Module (per industry):
--   - 6 items (item_i001-i006) - all Part type, Inventory tracking, Buy
--   - 6 parts
--
-- Purchasing Module (per industry):
--   - 3 suppliers (supp_001, supp_002, supp_003)
--   - 3 items (item_001, item_002, item_003) - all Part type, Inventory tracking, Buy
--   - 3 parts (for the 3 items) - required for items to be accessible
--   - 2 purchase orders (po_001, po_002)
--   - 3 purchase order lines (poline_001, poline_002, poline_003)
