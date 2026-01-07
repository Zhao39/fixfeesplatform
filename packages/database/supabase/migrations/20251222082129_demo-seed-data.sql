-- =========================================
-- Demo Seed Data - Sales Module Templates
-- =========================================
-- This migration creates demo templates for the 4 specific industries.
-- These are the actual template data that will be seeded into companies.
-- Limited to 2-3 items per type per industry.

-- =========================================
-- 1) HumanoTech Robotics (Robotics OEM) - Sales Module
-- =========================================

-- Create template set
INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_sales_v1', 'robotics_oem', 'Sales', 1, 'robotics_oem.sales.v1', 'HumanoTech Robotics Sales Demo', 'Demo data for humanoid robot manufacturing sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Customers (3)
INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('robotics_oem_sales_v1', 'cust_001', 'SmartFactory Automation', NULL, NULL, '45-1234567'),
  ('robotics_oem_sales_v1', 'cust_002', 'Global Logistics Corp', NULL, NULL, '78-9876543'),
  ('robotics_oem_sales_v1', 'cust_003', 'Healthcare Robotics Solutions', NULL, NULL, '23-4567890')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items (3)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('robotics_oem_sales_v1', 'item_001', 'HUM-R1', 'HumanoBot R1', 'Entry-level humanoid robot for warehouse automation', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_002', 'HUM-R2-PRO', 'HumanoBot R2 Pro', 'Advanced humanoid robot with AI vision system', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_003', 'HUM-ARM-KIT', 'Dual Arm Upgrade Kit', 'Precision dual-arm manipulation system', 'Part', 'Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes (2)
INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('robotics_oem_sales_v1', 'quote_001', 'Q-2025-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'SMART-WAREHOUSE-2025'),
  ('robotics_oem_sales_v1', 'quote_002', 'Q-2025-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '45 days', 'LOG-AUTO-456')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines (3)
INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('robotics_oem_sales_v1', 'qline_001', 'quote_001', 'item_001', 'HumanoBot R1 - Standard Config', 5, 85000.00),
  ('robotics_oem_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Dual Arm Upgrade Kit', 5, 35000.00),
  ('robotics_oem_sales_v1', 'qline_003', 'quote_002', 'item_002', 'HumanoBot R2 Pro - Full AI Suite', 3, 145000.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 2) SkyLine Precision Parts (CNC Aerospace) - Sales Module
-- =========================================

-- Create template set
INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_sales_v1', 'cnc_aerospace', 'Sales', 1, 'cnc_aerospace.sales.v1', 'SkyLine Precision Parts Sales Demo', 'Demo data for aerospace CNC machining sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Customers (3)
INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('cnc_aerospace_sales_v1', 'cust_001', 'AeroSpace Dynamics', NULL, NULL, '12-3456789'),
  ('cnc_aerospace_sales_v1', 'cust_002', 'Satellite Systems Inc', NULL, NULL, '98-7654321'),
  ('cnc_aerospace_sales_v1', 'cust_003', 'Defense Aviation Corp', NULL, NULL, '45-6789012')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items (3)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('cnc_aerospace_sales_v1', 'item_001', 'ASP-BRK-7075', 'Aluminum 7075 Bracket', 'Aerospace-grade aluminum bracket with AS9100 cert', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_002', 'ASP-TI-HSG', 'Titanium Housing Assembly', 'Ti-6Al-4V housing for satellite components', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_003', 'ASP-COMP-PLT', 'Carbon Composite Plate', 'CNC machined carbon fiber composite plate', 'Part', 'Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes (2)
INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('cnc_aerospace_sales_v1', 'quote_001', 'Q-ASP-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'RFQ-AERO-2025-045'),
  ('cnc_aerospace_sales_v1', 'quote_002', 'Q-ASP-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'SAT-COMP-789')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines (3)
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

-- Template Customers (3)
INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('metal_fab_sales_v1', 'cust_001', 'BuildRight Construction', NULL, NULL, '33-2468135'),
  ('metal_fab_sales_v1', 'cust_002', 'Industrial Steel Solutions', NULL, NULL, '44-1357924'),
  ('metal_fab_sales_v1', 'cust_003', 'Metro Infrastructure Group', NULL, NULL, '55-9876543')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items (3)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('metal_fab_sales_v1', 'item_001', 'TF-BEAM-W12', 'W12x26 Steel I-Beam', 'Structural steel I-beam, 20ft length', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('metal_fab_sales_v1', 'item_002', 'TF-TRUSS-CUST', 'Custom Steel Truss', 'Welded steel truss assembly per spec', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('metal_fab_sales_v1', 'item_003', 'TF-PLATE-BASE', 'Steel Base Plate', 'Heavy-duty base plate with anchor holes', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes (2)
INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('metal_fab_sales_v1', 'quote_001', 'Q-TF-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'BUILD-2025-789'),
  ('metal_fab_sales_v1', 'quote_002', 'Q-TF-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'IND-STEEL-456')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines (3)
INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('metal_fab_sales_v1', 'qline_001', 'quote_001', 'item_001', 'W12x26 Steel I-Beam - 20ft', 50, 285.00),
  ('metal_fab_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Steel Base Plate - Heavy Duty', 50, 125.00),
  ('metal_fab_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Custom Steel Truss - Per Drawing TF-2025-A', 12, 1850.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 4) Apex Motors Engineering (Automotive Precision) - Sales Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('auto_precision_sales_v1', 'automotive_precision', 'Sales', 1, 'automotive_precision.sales.v1', 'Apex Motors Engineering Sales Demo', 'Demo data for high-performance automotive parts sales', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Customers (3)
INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "customerTypeId", "customerStatusId", "taxId")
VALUES
  ('auto_precision_sales_v1', 'cust_001', 'Performance Racing Systems', NULL, NULL, '66-1122334'),
  ('auto_precision_sales_v1', 'cust_002', 'Velocity Motorsports', NULL, NULL, '77-4455667'),
  ('auto_precision_sales_v1', 'cust_003', 'Elite Automotive Group', NULL, NULL, '88-7788990')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items (3)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('auto_precision_sales_v1', 'item_001', 'APX-PISTON-HP', 'High-Performance Piston Set', 'Forged aluminum pistons for racing engines', 'Part', 'Inventory', 'Make', 'SET', TRUE),
  ('auto_precision_sales_v1', 'item_002', 'APX-CRANK-TI', 'Titanium Crankshaft', 'Precision-balanced titanium crankshaft', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('auto_precision_sales_v1', 'item_003', 'APX-VALVE-SS', 'Stainless Valve Set', 'High-temp stainless steel valve set', 'Part', 'Non-Inventory', 'Make', 'SET', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quotes (2)
INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference")
VALUES
  ('auto_precision_sales_v1', 'quote_001', 'Q-APX-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'RACE-ENG-2025'),
  ('auto_precision_sales_v1', 'quote_002', 'Q-APX-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'VEL-BUILD-789')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Quote Lines (3)
INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice")
VALUES
  ('auto_precision_sales_v1', 'qline_001', 'quote_001', 'item_001', 'High-Performance Piston Set - Racing Spec', 10, 2850.00),
  ('auto_precision_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Stainless Valve Set - High Temp', 10, 1250.00),
  ('auto_precision_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Titanium Crankshaft - Balanced', 5, 8500.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- Demo Seed Data - Parts and Inventory Module Templates
-- =========================================
-- Limited to 2-3 items per type per industry.

-- =========================================
-- 1) CNC Machining - Parts Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_parts_v1', 'cnc_aerospace', 'Parts', 1, 'cnc_aerospace.parts.v1', 'SkyLine Precision Parts - Parts Demo', 'Demo data for aerospace CNC parts and BOMs', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Parts (3 finished goods, 3 purchased components)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Finished goods (3)
  ('cnc_aerospace_parts_v1', 'item_fg001', 'FG-BRK-100', 'Aluminum Bracket Assembly', 'Complete bracket assembly with hardware', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_fg002', 'FG-HSG-200', 'Titanium Housing Assembly', 'Complete housing with seals and fasteners', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_fg003', 'FG-SFT-300', 'Shaft Assembly', 'Complete shaft assembly with bearings', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  -- Purchased components (3)
  ('cnc_aerospace_parts_v1', 'item_pc001', 'PC-SCREW-M6', 'M6 Socket Head Screw', 'M6x20mm socket head cap screw', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_pc002', 'PC-WASHER-M6', 'M6 Washer', 'M6 flat washer', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_pc003', 'PC-SEAL-001', 'O-Ring Seal 50mm', '50mm diameter Viton O-ring', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts (3)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('cnc_aerospace_parts_v1', 'item_fg001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_parts_v1', 'item_fg002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_aerospace_parts_v1', 'item_fg003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 2) CNC Machining - Inventory Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_inventory_v1', 'cnc_aerospace', 'Inventory', 1, 'cnc_aerospace.inventory.v1', 'SkyLine Precision Parts - Inventory Demo', 'Demo data for aerospace CNC inventory management', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Inventory (3 raw materials, 3 tooling)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Raw materials (3)
  ('cnc_aerospace_inventory_v1', 'item_rm001', 'RM-AL-6061-1', 'Aluminum 6061 Bar 1" Dia', '1 inch diameter 6061 aluminum bar stock', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_rm002', 'RM-TI-GR5-1', 'Titanium Grade 5 Bar 1" Dia', '1 inch diameter Ti-6Al-4V bar stock', 'Material', 'Inventory', 'Buy', 'FT', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_rm003', 'RM-SS-304-1', 'Stainless Steel 304 Bar 1"', '1 inch diameter 304 stainless bar', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),
  -- Tooling (3)
  ('cnc_aerospace_inventory_v1', 'item_tl001', 'TL-EM-0250', 'Carbide End Mill 1/4"', '1/4" 4-flute carbide end mill', 'Tool', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_tl002', 'TL-EM-0500', 'Carbide End Mill 1/2"', '1/2" 4-flute carbide end mill', 'Tool', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_tl003', 'TL-DR-SET-1', 'Drill Bit Set HSS', 'HSS drill bit set 1/16" to 1/2"', 'Tool', 'Non-Inventory', 'Buy', 'SET', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Materials for Inventory (matches Material type items above)
INSERT INTO demo_templates."material" ("templateSetId", "templateRowId", "materialFormName", "materialSubstanceName", "approved")
VALUES
  ('cnc_aerospace_inventory_v1', 'item_rm001', 'Round Bar', 'Aluminum', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_rm002', 'Round Bar', 'Titanium', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_rm003', 'Round Bar', 'Stainless Steel', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 3) Robotics - Parts Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_parts_v1', 'robotics_oem', 'Parts', 1, 'robotics_oem.parts.v1', 'HumanoTech Robotics - Parts Demo', 'Demo data for humanoid robotics parts and assemblies', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Robotics Parts (3 assemblies, 3 sub-components)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Robot assemblies (3)
  ('robotics_oem_parts_v1', 'item_r001', 'ROB-ARM-6DOF', '6-Axis Robot Arm', 'Complete 6-axis robotic arm assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r002', 'ROB-BASE-001', 'Robot Base Assembly', 'Robot base with mounting plate', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r003', 'ROB-JOINT-1', 'Joint 1 Assembly', 'Base rotation joint assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  -- Sub-components (3)
  ('robotics_oem_parts_v1', 'item_r101', 'ROB-MOTOR-1', 'Servo Motor 1kW', '1kW AC servo motor', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r102', 'ROB-ENCODER-001', 'Absolute Encoder', 'High-resolution absolute encoder', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_r103', 'ROB-GEARBOX-001', 'Harmonic Gearbox 100:1', '100:1 ratio harmonic drive gearbox', 'Material', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts for Robotics (3)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('robotics_oem_parts_v1', 'item_r001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_oem_parts_v1', 'item_r002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_oem_parts_v1', 'item_r003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 4) Robotics - Inventory Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_oem_inventory_v1', 'robotics_oem', 'Inventory', 1, 'robotics_oem.inventory.v1', 'HumanoTech Robotics - Inventory Demo', 'Demo data for humanoid robotics inventory management', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Robotics Inventory (3 electronic, 3 mechanical)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Electronic components (3) - Using 'Part' type since these don't fit materialForm/substance model
  ('robotics_oem_inventory_v1', 'item_e001', 'EL-PLC-001', 'PLC Controller', 'Industrial PLC with I/O modules', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_e002', 'EL-DRIVE-001', 'Servo Drive 3kW', '3kW servo motor drive', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_e003', 'EL-SENSOR-VIS', 'Vision Sensor', '2D vision sensor with LED illumination', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  -- Mechanical components (3) - Using 'Part' type for purchased components
  ('robotics_oem_inventory_v1', 'item_m001', 'MC-BEARING-6205', 'Ball Bearing 6205', '6205 deep groove ball bearing', 'Part', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_m002', 'MC-BELT-GT2', 'Timing Belt GT2', 'GT2 timing belt 6mm width', 'Part', 'Non-Inventory', 'Buy', 'FT', TRUE),
  ('robotics_oem_inventory_v1', 'item_m003', 'MC-PULLEY-GT2', 'Timing Pulley GT2 20T', 'GT2 timing pulley 20 teeth', 'Part', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts for Robotics Inventory (matches items above)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('robotics_oem_inventory_v1', 'item_e001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_inventory_v1', 'item_e002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_inventory_v1', 'item_e003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_inventory_v1', 'item_m001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_inventory_v1', 'item_m002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('robotics_oem_inventory_v1', 'item_m003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 5) Metal Fabrication - Parts Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fabrication_parts_v1', 'metal_fabrication', 'Parts', 1, 'metal_fabrication.parts.v1', 'TitanFab Industries - Parts Demo', 'Demo data for metal fabrication parts', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Metal Fab Parts (3 finished, 3 components)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Finished products (3)
  ('metal_fabrication_parts_v1', 'item_g001', 'PROD-001', 'Standard Widget', 'Standard production widget', 'Part', 'Non-Inventory', 'Buy and Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_g002', 'PROD-002', 'Premium Widget', 'Premium quality widget', 'Part', 'Non-Inventory', 'Buy and Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_g003', 'ASSY-001', 'Widget Assembly', 'Complete widget assembly', 'Part', 'Non-Inventory', 'Make', 'EA', TRUE),
  -- Components (3)
  ('metal_fabrication_parts_v1', 'item_g101', 'COMP-BASE', 'Widget Base', 'Base component for widget', 'Part', 'Non-Inventory', 'Buy and Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_g102', 'COMP-TOP', 'Widget Top', 'Top component for widget', 'Part', 'Non-Inventory', 'Buy and Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_g103', 'COMP-SPRING', 'Spring Component', 'Spring for widget assembly', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts for Metal Fabrication (3)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('metal_fabrication_parts_v1', 'item_g001', TRUE, CURRENT_DATE - INTERVAL '180 days', NULL),
  ('metal_fabrication_parts_v1', 'item_g002', TRUE, CURRENT_DATE - INTERVAL '180 days', NULL),
  ('metal_fabrication_parts_v1', 'item_g003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 6) Metal Fabrication - Inventory Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fabrication_inventory_v1', 'metal_fabrication', 'Inventory', 1, 'metal_fabrication.inventory.v1', 'TitanFab Industries - Inventory Demo', 'Demo data for metal fabrication inventory', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Metal Fab Inventory (3 raw materials, 3 hardware)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Raw materials - Steel as Material type, others as Part type (limited materialSubstance options)
  ('metal_fabrication_inventory_v1', 'item_rm001', 'RM-STEEL-SHEET', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Material', 'Non-Inventory', 'Buy', 'SQ FT', TRUE),
  ('metal_fabrication_inventory_v1', 'item_rm002', 'RM-PLASTIC-ABS', 'ABS Plastic Sheet', '1/8" ABS plastic sheet', 'Part', 'Non-Inventory', 'Buy', 'SQ FT', TRUE),
  ('metal_fabrication_inventory_v1', 'item_rm003', 'RM-WOOD-PLY', 'Plywood 3/4"', '3/4" birch plywood', 'Part', 'Non-Inventory', 'Buy', 'SQ FT', TRUE),
  -- Hardware (3) - Using Part type for fasteners
  ('metal_fabrication_inventory_v1', 'item_hw001', 'HW-SCREW-M4', 'M4x12mm Screw', 'M4x12mm pan head screw', 'Part', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_hw002', 'HW-SCREW-M6', 'M6x20mm Screw', 'M6x20mm socket head screw', 'Part', 'Non-Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_hw003', 'HW-NUT-M6', 'M6 Hex Nut', 'M6 hex nut', 'Part', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Material for Metal Fabrication (only for Steel Sheet)
INSERT INTO demo_templates."material" ("templateSetId", "templateRowId", "materialFormName", "materialSubstanceName", "approved")
VALUES
  ('metal_fabrication_inventory_v1', 'item_rm001', 'Sheet', 'Steel', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts for Metal Fabrication Inventory (non-Material items)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('metal_fabrication_inventory_v1', 'item_rm002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_inventory_v1', 'item_rm003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_inventory_v1', 'item_hw001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_inventory_v1', 'item_hw002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('metal_fabrication_inventory_v1', 'item_hw003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL)
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

-- Template Suppliers (3)
INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('robotics_oem_purchasing_v1', 'supp_001', 'Precision Motors Inc', NULL, NULL, '12-3456789'),
  ('robotics_oem_purchasing_v1', 'supp_002', 'Advanced Electronics Supply', NULL, NULL, '23-4567890'),
  ('robotics_oem_purchasing_v1', 'supp_003', 'Robotic Components Co', NULL, NULL, '34-5678901')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items (3)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('robotics_oem_purchasing_v1', 'item_001', 'MAT-SERVO-1KW', 'Servo Motor 1kW', '1kW AC servo motor for robot joints', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'item_002', 'MAT-ENCODER-ABS', 'Absolute Encoder', 'High-resolution absolute encoder', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'item_003', 'MAT-GEARBOX-100', 'Harmonic Gearbox 100:1', '100:1 ratio harmonic drive', 'Material', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Orders (2)
INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('robotics_oem_purchasing_v1', 'po_001', 'PO-2025-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'po_002', 'PO-2025-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Order Lines (3)
INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('robotics_oem_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Servo Motor 1kW - Standard', 20, 850.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Absolute Encoder - High Res', 20, 450.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Harmonic Gearbox 100:1', 15, 1250.00, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 7b) CNC Aerospace - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_aerospace_purchasing_v1', 'cnc_aerospace', 'Purchasing', 1, 'cnc_aerospace.purchasing.v1', 'SkyLine Precision Parts Purchasing Demo', 'Demo data for aerospace CNC purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Suppliers (3)
INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('cnc_aerospace_purchasing_v1', 'supp_001', 'Aerospace Metals Supply', NULL, NULL, '11-2233445'),
  ('cnc_aerospace_purchasing_v1', 'supp_002', 'Precision Tooling Co', NULL, NULL, '22-3344556'),
  ('cnc_aerospace_purchasing_v1', 'supp_003', 'Aerospace Fasteners Inc', NULL, NULL, '33-4455667')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items (3)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('cnc_aerospace_purchasing_v1', 'item_001', 'MAT-AL-6061-BAR', 'Aluminum 6061 Bar 2"', '2 inch diameter 6061 aluminum bar stock', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_002', 'MAT-TI-GR5-BAR', 'Titanium Grade 5 Bar 1"', '1 inch diameter Ti-6Al-4V bar stock', 'Material', 'Inventory', 'Buy', 'FT', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_003', 'MAT-EM-1/2', 'Carbide End Mill 1/2"', '1/2" 4-flute carbide end mill', 'Tool', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Orders (2)
INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('cnc_aerospace_purchasing_v1', 'po_001', 'PO-ASP-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'po_002', 'PO-ASP-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '18 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Order Lines (3)
INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('cnc_aerospace_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Aluminum 6061 Bar 2" - Aerospace Grade', 500, 8.50, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Titanium Grade 5 Bar 1"', 200, 45.00, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Carbide End Mill 1/2" - Premium', 25, 125.00, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '18 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 7c) Metal Fabrication - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('metal_fabrication_purchasing_v1', 'metal_fabrication', 'Purchasing', 1, 'metal_fabrication.purchasing.v1', 'TitanFab Industries Purchasing Demo', 'Demo data for metal fabrication purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Suppliers (3)
INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('metal_fabrication_purchasing_v1', 'supp_001', 'Steel Supply Co', NULL, NULL, '44-5566778'),
  ('metal_fabrication_purchasing_v1', 'supp_002', 'Industrial Hardware Supply', NULL, NULL, '55-6677889'),
  ('metal_fabrication_purchasing_v1', 'supp_003', 'Welding Supplies Inc', NULL, NULL, '66-7788990')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items (3)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('metal_fabrication_purchasing_v1', 'item_001', 'MAT-STEEL-SHEET-16GA', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Material', 'Non-Inventory', 'Buy', 'SQ FT', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_002', 'MAT-STEEL-BEAM-W12', 'W12x26 Steel I-Beam', 'W12x26 structural steel I-beam', 'Material', 'Non-Inventory', 'Buy', 'FT', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_003', 'MAT-WELD-ROD-7018', 'Welding Rod 7018', '7018 welding electrode', 'Consumable', 'Non-Inventory', 'Buy', 'LB', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Orders (2)
INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('metal_fabrication_purchasing_v1', 'po_001', 'PO-TF-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '7 days'),
  ('metal_fabrication_purchasing_v1', 'po_002', 'PO-TF-002', 'supp_003', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '12 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Order Lines (3)
INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('metal_fabrication_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Steel Sheet 16GA - Cold Rolled', 2000, 2.85, CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '7 days'),
  ('metal_fabrication_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'W12x26 Steel I-Beam - 20ft', 50, 285.00, CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '7 days'),
  ('metal_fabrication_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Welding Rod 7018 - 50lb', 200, 4.25, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '12 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 7d) Automotive Precision - Purchasing Module
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('automotive_precision_purchasing_v1', 'automotive_precision', 'Purchasing', 1, 'automotive_precision.purchasing.v1', 'Apex Motors Engineering Purchasing Demo', 'Demo data for automotive precision purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Suppliers (3)
INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "supplierTypeId", "supplierStatusId", "taxId")
VALUES
  ('automotive_precision_purchasing_v1', 'supp_001', 'Precision Metals Supply', NULL, NULL, '77-8899001'),
  ('automotive_precision_purchasing_v1', 'supp_002', 'Racing Components Inc', NULL, NULL, '88-9900112'),
  ('automotive_precision_purchasing_v1', 'supp_003', 'Performance Fasteners Co', NULL, NULL, '99-0011223')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Items (3)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  ('automotive_precision_purchasing_v1', 'item_001', 'MAT-AL-FORGED-BLK', 'Forged Aluminum Blank', 'Forged aluminum blank for pistons', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'item_002', 'MAT-TI-BAR-1', 'Titanium Bar 1"', '1 inch diameter titanium bar for crankshaft', 'Material', 'Inventory', 'Buy', 'FT', TRUE),
  ('automotive_precision_purchasing_v1', 'item_003', 'MAT-SS-VALVE', 'Stainless Valve Blank', 'Stainless steel valve blank', 'Material', 'Non-Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Orders (2)
INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('automotive_precision_purchasing_v1', 'po_001', 'PO-APX-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'po_002', 'PO-APX-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '18 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Purchase Order Lines (3)
INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate")
VALUES
  ('automotive_precision_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Forged Aluminum Blank - Racing Grade', 50, 125.00, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Titanium Bar 1" - High Grade', 100, 85.00, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Stainless Valve Blank - High Temp', 200, 8.50, CURRENT_DATE + INTERVAL '21 days', CURRENT_DATE + INTERVAL '18 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- Summary of Template Sets Created (Reduced)
-- =========================================
-- Per Industry (Sales Module):
--   - 3 customers, 3 items, 2 quotes, 3 quote lines
--
-- Per Industry (Parts Module):
--   - 6 items (3 finished/assemblies, 3 components), 3 parts
--
-- Per Industry (Inventory Module):
--   - 6 items (3 raw materials, 3 tools/hardware)
--
-- Per Industry (Purchasing Module):
--   - 3 suppliers, 3 items, 2 purchase orders, 3 purchase order lines
