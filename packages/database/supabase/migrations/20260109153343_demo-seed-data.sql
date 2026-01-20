-- Demo Seed Data: 4 industries × 4 modules
-- Simplified structure with proper nested BOMs
-- Robotics OEM: Deep assembly (robot → arm → components)
-- CNC Aerospace: Shallow (machined bracket from stock)
-- Metal Fabrication: Shallow (fabricated enclosure from sheet)
-- Automotive Precision: Medium (piston assembly → piston body → forging)


INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem") VALUES
  -- Robotics OEM
  ('robotics_oem_sales_v1', 'robotics_oem', 'Sales', 1, 'robotics_oem.sales.v1', 'Robotics OEM Sales Demo', 'Demo data for robotics sales', TRUE),
  ('robotics_oem_parts_v1', 'robotics_oem', 'Parts', 1, 'robotics_oem.parts.v1', 'Robotics OEM Parts Demo', 'Demo data for robotics parts and BOMs', TRUE),
  ('robotics_oem_inventory_v1', 'robotics_oem', 'Inventory', 1, 'robotics_oem.inventory.v1', 'Robotics OEM Inventory Demo', 'Demo data for robotics inventory', TRUE),
  ('robotics_oem_purchasing_v1', 'robotics_oem', 'Purchasing', 1, 'robotics_oem.purchasing.v1', 'Robotics OEM Purchasing Demo', 'Demo data for robotics purchasing', TRUE),
  -- CNC Aerospace
  ('cnc_aerospace_sales_v1', 'cnc_aerospace', 'Sales', 1, 'cnc_aerospace.sales.v1', 'CNC Aerospace Sales Demo', 'Demo data for CNC aerospace sales', TRUE),
  ('cnc_aerospace_parts_v1', 'cnc_aerospace', 'Parts', 1, 'cnc_aerospace.parts.v1', 'CNC Aerospace Parts Demo', 'Demo data for CNC aerospace parts and BOMs', TRUE),
  ('cnc_aerospace_inventory_v1', 'cnc_aerospace', 'Inventory', 1, 'cnc_aerospace.inventory.v1', 'CNC Aerospace Inventory Demo', 'Demo data for CNC aerospace inventory', TRUE),
  ('cnc_aerospace_purchasing_v1', 'cnc_aerospace', 'Purchasing', 1, 'cnc_aerospace.purchasing.v1', 'CNC Aerospace Purchasing Demo', 'Demo data for CNC aerospace purchasing', TRUE),
  -- Metal Fabrication
  ('metal_fabrication_sales_v1', 'metal_fabrication', 'Sales', 1, 'metal_fabrication.sales.v1', 'Metal Fabrication Sales Demo', 'Demo data for metal fabrication sales', TRUE),
  ('metal_fabrication_parts_v1', 'metal_fabrication', 'Parts', 1, 'metal_fabrication.parts.v1', 'Metal Fabrication Parts Demo', 'Demo data for metal fabrication parts and BOMs', TRUE),
  ('metal_fabrication_inventory_v1', 'metal_fabrication', 'Inventory', 1, 'metal_fabrication.inventory.v1', 'Metal Fabrication Inventory Demo', 'Demo data for metal fabrication inventory', TRUE),
  ('metal_fabrication_purchasing_v1', 'metal_fabrication', 'Purchasing', 1, 'metal_fabrication.purchasing.v1', 'Metal Fabrication Purchasing Demo', 'Demo data for metal fabrication purchasing', TRUE),
  -- Automotive Precision
  ('automotive_precision_sales_v1', 'automotive_precision', 'Sales', 1, 'automotive_precision.sales.v1', 'Automotive Precision Sales Demo', 'Demo data for automotive precision sales', TRUE),
  ('automotive_precision_parts_v1', 'automotive_precision', 'Parts', 1, 'automotive_precision.parts.v1', 'Automotive Precision Parts Demo', 'Demo data for automotive precision parts and BOMs', TRUE),
  ('automotive_precision_inventory_v1', 'automotive_precision', 'Inventory', 1, 'automotive_precision.inventory.v1', 'Automotive Precision Inventory Demo', 'Demo data for automotive precision inventory', TRUE),
  ('automotive_precision_purchasing_v1', 'automotive_precision', 'Purchasing', 1, 'automotive_precision.purchasing.v1', 'Automotive Precision Purchasing Demo', 'Demo data for automotive precision purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- ============================================================================
-- SALES MODULE: Items (1 Make item per industry for quoting)
-- ============================================================================
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "defaultMethodType", "unitOfMeasureCode", "active") VALUES
  ('robotics_oem_sales_v1', 'robot', 'HUM-R1', 'Humanoid Robot', 'Complete humanoid robot for warehouse automation', 'Part', 'Inventory', 'Make', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'bracket', 'BRK-7075', 'Aerospace Bracket', 'Precision machined aerospace bracket AS9100 certified', 'Part', 'Inventory', 'Make', 'Make', 'EA', TRUE),
  ('metal_fabrication_sales_v1', 'enclosure', 'ENC-001', 'Steel Enclosure', 'Fabricated steel electrical enclosure', 'Part', 'Inventory', 'Make', 'Make', 'EA', TRUE),
  ('automotive_precision_sales_v1', 'piston', 'PIS-ASSY', 'Piston Assembly', 'High-performance forged piston assembly', 'Part', 'Inventory', 'Make', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- PARTS MODULE: Items (ALL items needed for BOMs - Make + Buy + Materials)
-- ============================================================================
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "defaultMethodType", "unitOfMeasureCode", "active") VALUES
  -- Robotics OEM Parts (Deep nested BOM)
  ('robotics_oem_parts_v1', 'robot_assy', 'ROB-R1', 'Humanoid Robot Assembly', 'Complete humanoid robot assembly', 'Part', 'Inventory', 'Make', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'arm_assy', 'ARM-001', 'Arm Assembly', 'Robot arm assembly with servo and encoder', 'Part', 'Inventory', 'Make', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'ctrl_unit', 'CTRL-001', 'Control Unit', 'Robot control unit with embedded computer', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'chassis', 'CHAS-001', 'Chassis Frame', 'Welded steel chassis frame', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'servo_motor', 'SRV-001', 'Servo Motor', '1kW AC servo motor', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'encoder', 'ENC-001', 'Absolute Encoder', 'High-resolution absolute encoder', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'al_bar', 'MAT-AL-BAR', 'Aluminum Bar Stock', '1" diameter 6061-T6 aluminum bar', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),

  -- CNC Aerospace Parts (Shallow BOM - machined from stock)
  ('cnc_aerospace_parts_v1', 'bracket_assy', 'BRK-7075', 'Aerospace Bracket', 'Precision machined aerospace bracket', 'Part', 'Inventory', 'Make', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'al_plate', 'MAT-AL-PLT', 'Aluminum 7075 Plate', '1" thick 7075-T651 aluminum plate', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'hw_kit', 'HW-KIT-01', 'Hardware Kit', 'AN hardware kit with screws and washers', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),

  -- Metal Fabrication Parts (Shallow BOM - fabricated from sheet)
  ('metal_fabrication_parts_v1', 'enclosure_assy', 'ENC-001', 'Steel Enclosure', 'Fabricated steel electrical enclosure', 'Part', 'Inventory', 'Make', 'Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'steel_sheet', 'MAT-STL-SHT', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'hinges', 'HNG-001', 'Door Hinges', 'Heavy-duty piano hinges', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'fasteners', 'FST-001', 'Fastener Kit', 'Screws, nuts, and washers kit', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),

  -- Automotive Precision Parts (Medium nested BOM)
  ('automotive_precision_parts_v1', 'piston_assy', 'PIS-ASSY', 'Piston Assembly', 'Complete piston assembly with rings', 'Part', 'Inventory', 'Make', 'Make', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'piston_body', 'PIS-BODY', 'Piston Body', 'Forged and machined piston body', 'Part', 'Inventory', 'Make', 'Make', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'piston_rings', 'PIS-RING', 'Piston Ring Set', 'High-performance piston ring set', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'wrist_pin', 'PIS-PIN', 'Wrist Pin', 'Hardened steel wrist pin', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'al_forging', 'MAT-AL-FRG', 'Aluminum Forging', '4" diameter 2618-T61 forged blank', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- INVENTORY MODULE: Items (Buy items and Materials for tracking)
-- ============================================================================
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "defaultMethodType", "unitOfMeasureCode", "active") VALUES
  -- Robotics OEM Inventory
  ('robotics_oem_inventory_v1', 'ctrl_unit', 'CTRL-001', 'Control Unit', 'Robot control unit with embedded computer', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'servo_motor', 'SRV-001', 'Servo Motor', '1kW AC servo motor', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'encoder', 'ENC-001', 'Absolute Encoder', 'High-resolution absolute encoder', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'al_bar', 'MAT-AL-BAR', 'Aluminum Bar Stock', '1" diameter 6061-T6 aluminum bar', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),

  -- CNC Aerospace Inventory
  ('cnc_aerospace_inventory_v1', 'al_plate', 'MAT-AL-PLT', 'Aluminum 7075 Plate', '1" thick 7075-T651 aluminum plate', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'hw_kit', 'HW-KIT-01', 'Hardware Kit', 'AN hardware kit with screws and washers', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),

  -- Metal Fabrication Inventory
  ('metal_fabrication_inventory_v1', 'steel_sheet', 'MAT-STL-SHT', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'hinges', 'HNG-001', 'Door Hinges', 'Heavy-duty piano hinges', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'fasteners', 'FST-001', 'Fastener Kit', 'Screws, nuts, and washers kit', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),

  -- Automotive Precision Inventory
  ('automotive_precision_inventory_v1', 'piston_rings', 'PIS-RING', 'Piston Ring Set', 'High-performance piston ring set', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'wrist_pin', 'PIS-PIN', 'Wrist Pin', 'Hardened steel wrist pin', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'al_forging', 'MAT-AL-FRG', 'Aluminum Forging', '4" diameter 2618-T61 forged blank', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- PURCHASING MODULE: Items (Buy items and Materials for POs)
-- ============================================================================
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "defaultMethodType", "unitOfMeasureCode", "active") VALUES
  -- Robotics OEM Purchasing
  ('robotics_oem_purchasing_v1', 'ctrl_unit', 'CTRL-001', 'Control Unit', 'Robot control unit with embedded computer', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'servo_motor', 'SRV-001', 'Servo Motor', '1kW AC servo motor', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'al_bar', 'MAT-AL-BAR', 'Aluminum Bar Stock', '1" diameter 6061-T6 aluminum bar', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),

  -- CNC Aerospace Purchasing
  ('cnc_aerospace_purchasing_v1', 'al_plate', 'MAT-AL-PLT', 'Aluminum 7075 Plate', '1" thick 7075-T651 aluminum plate', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_purchasing_v1', 'hw_kit', 'HW-KIT-01', 'Hardware Kit', 'AN hardware kit with screws and washers', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),

  -- Metal Fabrication Purchasing
  ('metal_fabrication_purchasing_v1', 'steel_sheet', 'MAT-STL-SHT', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('metal_fabrication_purchasing_v1', 'hinges', 'HNG-001', 'Door Hinges', 'Heavy-duty piano hinges', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),

  -- Automotive Precision Purchasing
  ('automotive_precision_purchasing_v1', 'piston_rings', 'PIS-RING', 'Piston Ring Set', 'High-performance piston ring set', 'Part', 'Inventory', 'Buy', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'al_forging', 'MAT-AL-FRG', 'Aluminum Forging', '4" diameter 2618-T61 forged blank', 'Material', 'Inventory', 'Buy', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- PART RECORDS (for all Part-type items)
-- ============================================================================
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate") VALUES
  -- Sales Module Parts
  ('robotics_oem_sales_v1', 'robot', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('cnc_aerospace_sales_v1', 'bracket', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('metal_fabrication_sales_v1', 'enclosure', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('automotive_precision_sales_v1', 'piston', TRUE, CURRENT_DATE - INTERVAL '90 days'),

  -- Parts Module Parts (Robotics OEM)
  ('robotics_oem_parts_v1', 'robot_assy', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('robotics_oem_parts_v1', 'arm_assy', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('robotics_oem_parts_v1', 'ctrl_unit', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_parts_v1', 'chassis', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_parts_v1', 'servo_motor', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_parts_v1', 'encoder', TRUE, CURRENT_DATE - INTERVAL '30 days'),

  -- Parts Module Parts (CNC Aerospace)
  ('cnc_aerospace_parts_v1', 'bracket_assy', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('cnc_aerospace_parts_v1', 'hw_kit', TRUE, CURRENT_DATE - INTERVAL '30 days'),

  -- Parts Module Parts (Metal Fabrication)
  ('metal_fabrication_parts_v1', 'enclosure_assy', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('metal_fabrication_parts_v1', 'hinges', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_parts_v1', 'fasteners', TRUE, CURRENT_DATE - INTERVAL '30 days'),

  -- Parts Module Parts (Automotive Precision)
  ('automotive_precision_parts_v1', 'piston_assy', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('automotive_precision_parts_v1', 'piston_body', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('automotive_precision_parts_v1', 'piston_rings', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_parts_v1', 'wrist_pin', TRUE, CURRENT_DATE - INTERVAL '30 days'),

  -- Inventory Module Parts
  ('robotics_oem_inventory_v1', 'ctrl_unit', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_inventory_v1', 'servo_motor', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_inventory_v1', 'encoder', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_inventory_v1', 'hw_kit', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_inventory_v1', 'hinges', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_inventory_v1', 'fasteners', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_inventory_v1', 'piston_rings', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_inventory_v1', 'wrist_pin', TRUE, CURRENT_DATE - INTERVAL '30 days'),

  -- Purchasing Module Parts
  ('robotics_oem_purchasing_v1', 'ctrl_unit', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_purchasing_v1', 'servo_motor', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_purchasing_v1', 'hw_kit', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_purchasing_v1', 'hinges', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_purchasing_v1', 'piston_rings', TRUE, CURRENT_DATE - INTERVAL '30 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- MATERIAL RECORDS (for all Material-type items)
-- ============================================================================
INSERT INTO demo_templates."material" ("templateSetId", "templateRowId", "materialFormName", "materialSubstanceName", "approved") VALUES
  -- Parts Module Materials
  ('robotics_oem_parts_v1', 'al_bar', 'Round Bar', 'Aluminum', TRUE),
  ('cnc_aerospace_parts_v1', 'al_plate', 'Plate', 'Aluminum', TRUE),
  ('metal_fabrication_parts_v1', 'steel_sheet', 'Sheet', 'Steel', TRUE),
  ('automotive_precision_parts_v1', 'al_forging', 'Round Bar', 'Aluminum', TRUE),

  -- Inventory Module Materials
  ('robotics_oem_inventory_v1', 'al_bar', 'Round Bar', 'Aluminum', TRUE),
  ('cnc_aerospace_inventory_v1', 'al_plate', 'Plate', 'Aluminum', TRUE),
  ('metal_fabrication_inventory_v1', 'steel_sheet', 'Sheet', 'Steel', TRUE),
  ('automotive_precision_inventory_v1', 'al_forging', 'Round Bar', 'Aluminum', TRUE),

  -- Purchasing Module Materials
  ('robotics_oem_purchasing_v1', 'al_bar', 'Round Bar', 'Aluminum', TRUE),
  ('cnc_aerospace_purchasing_v1', 'al_plate', 'Plate', 'Aluminum', TRUE),
  ('metal_fabrication_purchasing_v1', 'steel_sheet', 'Sheet', 'Steel', TRUE),
  ('automotive_precision_purchasing_v1', 'al_forging', 'Round Bar', 'Aluminum', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- CUSTOMERS (2 per industry for Sales module)
-- ============================================================================
INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "taxId") VALUES
  ('robotics_oem_sales_v1', 'cust_001', 'SmartFactory Automation', '45-1234567'),
  ('robotics_oem_sales_v1', 'cust_002', 'Global Logistics Corp', '78-9876543'),
  ('cnc_aerospace_sales_v1', 'cust_001', 'AeroSpace Dynamics', '12-3456789'),
  ('cnc_aerospace_sales_v1', 'cust_002', 'Satellite Systems Inc', '98-7654321'),
  ('metal_fabrication_sales_v1', 'cust_001', 'BuildRight Construction', '33-2468135'),
  ('metal_fabrication_sales_v1', 'cust_002', 'Industrial Steel Solutions', '44-1357924'),
  ('automotive_precision_sales_v1', 'cust_001', 'Performance Racing Systems', '66-1122334'),
  ('automotive_precision_sales_v1', 'cust_002', 'Velocity Motorsports', '77-4455667')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- QUOTES (1 per industry)
-- ============================================================================
INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference") VALUES
  ('robotics_oem_sales_v1', 'quote_001', 'Q-ROB-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('cnc_aerospace_sales_v1', 'quote_001', 'Q-CNC-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('metal_fabrication_sales_v1', 'quote_001', 'Q-FAB-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('automotive_precision_sales_v1', 'quote_001', 'Q-AUTO-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- QUOTE LINES (references Sales module items)
-- ============================================================================
INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice") VALUES
  ('robotics_oem_sales_v1', 'qline_001', 'quote_001', 'robot', 'Humanoid Robot - Standard Config', 5, 85000.00),
  ('cnc_aerospace_sales_v1', 'qline_001', 'quote_001', 'bracket', 'Aerospace Bracket - AS9100 Certified', 250, 125.00),
  ('metal_fabrication_sales_v1', 'qline_001', 'quote_001', 'enclosure', 'Steel Enclosure - Standard Size', 25, 450.00),
  ('automotive_precision_sales_v1', 'qline_001', 'quote_001', 'piston', 'Piston Assembly - Racing Grade', 48, 285.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- SUPPLIERS (2 per industry for Purchasing module)
-- ============================================================================
INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "taxId") VALUES
  ('robotics_oem_purchasing_v1', 'supp_001', 'Precision Motors Inc', '12-3456789'),
  ('robotics_oem_purchasing_v1', 'supp_002', 'Advanced Electronics Supply', '23-4567890'),
  ('cnc_aerospace_purchasing_v1', 'supp_001', 'Aerospace Metals Supply', '11-2233445'),
  ('cnc_aerospace_purchasing_v1', 'supp_002', 'Precision Tooling Co', '22-3344556'),
  ('metal_fabrication_purchasing_v1', 'supp_001', 'Steel Supply Co', '44-5566778'),
  ('metal_fabrication_purchasing_v1', 'supp_002', 'Industrial Hardware Supply', '55-6677889'),
  ('automotive_precision_purchasing_v1', 'supp_001', 'Precision Metals Supply', '77-8899001'),
  ('automotive_precision_purchasing_v1', 'supp_002', 'Racing Components Inc', '88-9900112')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- PURCHASE ORDERS (1 per industry)
-- ============================================================================
INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate") VALUES
  ('robotics_oem_purchasing_v1', 'po_001', 'PO-ROB-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'po_001', 'PO-CNC-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('metal_fabrication_purchasing_v1', 'po_001', 'PO-FAB-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'po_001', 'PO-AUTO-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- PURCHASE ORDER LINES (references Purchasing module items)
-- ============================================================================
INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate") VALUES
  ('robotics_oem_purchasing_v1', 'poline_001', 'po_001', 'servo_motor', 'Servo Motor 1kW - Standard', 20, 850.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'poline_002', 'po_001', 'al_bar', 'Aluminum Bar Stock 1"', 100, 12.50, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_001', 'po_001', 'al_plate', 'Aluminum 7075 Plate 1"', 50, 185.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_002', 'po_001', 'hw_kit', 'AN Hardware Kit', 100, 25.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('metal_fabrication_purchasing_v1', 'poline_001', 'po_001', 'steel_sheet', 'Steel Sheet 16GA - 4x8', 200, 45.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('metal_fabrication_purchasing_v1', 'poline_002', 'po_001', 'hinges', 'Piano Hinges 48"', 50, 18.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'poline_001', 'po_001', 'al_forging', 'Aluminum Forging Blank 4"', 100, 125.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'poline_002', 'po_001', 'piston_rings', 'Piston Ring Set - Racing', 200, 85.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- WORK CENTERS (in Parts module)
-- ============================================================================
INSERT INTO demo_templates."workCenter" ("templateSetId", "templateRowId", "name", "description", "machineRate", "overheadRate", "laborRate", "defaultStandardFactor") VALUES
  -- Robotics OEM
  ('robotics_oem_parts_v1', 'wc_assembly', 'Assembly Line', 'Main robot assembly line', 25.00, 25.00, 75.00, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'wc_welding', 'Welding Station', 'TIG/MIG welding station', 35.00, 30.00, 85.00, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'wc_electronics', 'Electronics Lab', 'Electronics assembly and wiring', 30.00, 25.00, 80.00, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'wc_test', 'Test Chamber', 'Robot testing and calibration', 45.00, 35.00, 95.00, 'Hours/Piece'),
  -- CNC Aerospace
  ('cnc_aerospace_parts_v1', 'wc_cnc_mill', 'CNC Mill', 'Haas VF-4 vertical machining center', 75.00, 45.00, 65.00, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'wc_inspect', 'Inspection Bay', 'CMM and quality inspection', 40.00, 30.00, 55.00, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'wc_deburr', 'Deburr Station', 'Manual deburring and finishing', 20.00, 20.00, 45.00, 'Hours/Piece'),
  -- Metal Fabrication
  ('metal_fabrication_parts_v1', 'wc_cutting', 'Cutting Table', 'Plasma/laser cutting table', 55.00, 35.00, 55.00, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'wc_welding', 'Welding Bay', 'MIG/TIG welding station', 40.00, 30.00, 65.00, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'wc_press', 'Press Brake', 'CNC press brake', 60.00, 35.00, 60.00, 'Hours/Piece'),
  -- Automotive Precision
  ('automotive_precision_parts_v1', 'wc_cnc', 'CNC Machining Center', '5-axis CNC machining', 80.00, 45.00, 70.00, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'wc_assembly', 'Assembly Bench', 'Precision assembly station', 30.00, 30.00, 65.00, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'wc_balance', 'Balancing Machine', 'Dynamic balancing equipment', 55.00, 35.00, 75.00, 'Hours/Piece')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- PROCESSES (in Parts module)
-- ============================================================================
INSERT INTO demo_templates."process" ("templateSetId", "templateRowId", "name", "defaultStandardFactor") VALUES
  -- Robotics OEM
  ('robotics_oem_parts_v1', 'proc_assembly', 'Assembly', 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'proc_welding', 'Welding', 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'proc_wiring', 'Wiring', 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'proc_testing', 'Testing', 'Hours/Piece'),
  -- CNC Aerospace
  ('cnc_aerospace_parts_v1', 'proc_machining', 'CNC Machining', 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'proc_inspect', 'Inspection', 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'proc_deburr', 'Deburr', 'Hours/Piece'),
  -- Metal Fabrication
  ('metal_fabrication_parts_v1', 'proc_cutting', 'Cutting', 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'proc_welding', 'Welding', 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'proc_forming', 'Forming', 'Hours/Piece'),
  -- Automotive Precision
  ('automotive_precision_parts_v1', 'proc_machining', 'Machining', 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'proc_assembly', 'Assembly', 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'proc_balancing', 'Balancing', 'Hours/Piece')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- WORK CENTER PROCESS MAPPINGS
-- ============================================================================
INSERT INTO demo_templates."workCenterProcess" ("templateSetId", "tplWorkCenterId", "tplProcessId") VALUES
  -- Robotics OEM
  ('robotics_oem_parts_v1', 'wc_assembly', 'proc_assembly'),
  ('robotics_oem_parts_v1', 'wc_welding', 'proc_welding'),
  ('robotics_oem_parts_v1', 'wc_electronics', 'proc_wiring'),
  ('robotics_oem_parts_v1', 'wc_test', 'proc_testing'),
  -- CNC Aerospace
  ('cnc_aerospace_parts_v1', 'wc_cnc_mill', 'proc_machining'),
  ('cnc_aerospace_parts_v1', 'wc_inspect', 'proc_inspect'),
  ('cnc_aerospace_parts_v1', 'wc_deburr', 'proc_deburr'),
  -- Metal Fabrication
  ('metal_fabrication_parts_v1', 'wc_cutting', 'proc_cutting'),
  ('metal_fabrication_parts_v1', 'wc_welding', 'proc_welding'),
  ('metal_fabrication_parts_v1', 'wc_press', 'proc_forming'),
  -- Automotive Precision
  ('automotive_precision_parts_v1', 'wc_cnc', 'proc_machining'),
  ('automotive_precision_parts_v1', 'wc_assembly', 'proc_assembly'),
  ('automotive_precision_parts_v1', 'wc_balance', 'proc_balancing')
ON CONFLICT ("templateSetId", "tplWorkCenterId", "tplProcessId") DO NOTHING;

-- ============================================================================
-- MAKE METHODS (only for Make items in Parts module)
-- ============================================================================
INSERT INTO demo_templates."makeMethod" ("templateSetId", "templateRowId", "tplItemId") VALUES
  -- Robotics OEM (2 methods for nested BOM)
  ('robotics_oem_parts_v1', 'mm_robot', 'robot_assy'),
  ('robotics_oem_parts_v1', 'mm_arm', 'arm_assy'),
  -- CNC Aerospace (1 method for flat BOM)
  ('cnc_aerospace_parts_v1', 'mm_bracket', 'bracket_assy'),
  -- Metal Fabrication (1 method for flat BOM)
  ('metal_fabrication_parts_v1', 'mm_enclosure', 'enclosure_assy'),
  -- Automotive Precision (2 methods for nested BOM)
  ('automotive_precision_parts_v1', 'mm_piston_assy', 'piston_assy'),
  ('automotive_precision_parts_v1', 'mm_piston_body', 'piston_body')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- METHOD MATERIALS (BOMs with proper nesting)
-- ============================================================================
INSERT INTO demo_templates."methodMaterial" ("templateSetId", "templateRowId", "tplMakeMethodId", "tplItemId", "methodType", "tplMaterialMakeMethodId", "itemType", "quantity", "unitOfMeasureCode") VALUES
  -- Robotics OEM: Robot Assembly BOM (nested)
  -- Robot contains: Arm Assembly (Make x2), Control Unit (Buy), Chassis (Buy)
  ('robotics_oem_parts_v1', 'bom_robot_arm', 'mm_robot', 'arm_assy', 'Make', 'mm_arm', 'Part', 2, 'EA'),
  ('robotics_oem_parts_v1', 'bom_robot_ctrl', 'mm_robot', 'ctrl_unit', 'Buy', NULL, 'Part', 1, 'EA'),
  ('robotics_oem_parts_v1', 'bom_robot_chassis', 'mm_robot', 'chassis', 'Buy', NULL, 'Part', 1, 'EA'),
  -- Arm Assembly BOM (subassembly)
  -- Arm contains: Servo Motor (Buy), Encoder (Buy), Aluminum Bar (Material)
  ('robotics_oem_parts_v1', 'bom_arm_servo', 'mm_arm', 'servo_motor', 'Buy', NULL, 'Part', 1, 'EA'),
  ('robotics_oem_parts_v1', 'bom_arm_encoder', 'mm_arm', 'encoder', 'Buy', NULL, 'Part', 1, 'EA'),
  ('robotics_oem_parts_v1', 'bom_arm_albar', 'mm_arm', 'al_bar', 'Buy', NULL, 'Material', 2, 'EA'),

  -- CNC Aerospace: Bracket BOM (flat)
  -- Bracket contains: Aluminum Plate (Material), Hardware Kit (Buy)
  ('cnc_aerospace_parts_v1', 'bom_bracket_plate', 'mm_bracket', 'al_plate', 'Buy', NULL, 'Material', 1, 'EA'),
  ('cnc_aerospace_parts_v1', 'bom_bracket_hw', 'mm_bracket', 'hw_kit', 'Buy', NULL, 'Part', 1, 'EA'),

  -- Metal Fabrication: Enclosure BOM (flat)
  -- Enclosure contains: Steel Sheet (Material), Hinges (Buy), Fasteners (Buy)
  ('metal_fabrication_parts_v1', 'bom_enc_sheet', 'mm_enclosure', 'steel_sheet', 'Buy', NULL, 'Material', 4, 'EA'),
  ('metal_fabrication_parts_v1', 'bom_enc_hinges', 'mm_enclosure', 'hinges', 'Buy', NULL, 'Part', 2, 'EA'),
  ('metal_fabrication_parts_v1', 'bom_enc_fasteners', 'mm_enclosure', 'fasteners', 'Buy', NULL, 'Part', 1, 'EA'),

  -- Automotive Precision: Piston Assembly BOM (nested)
  -- Piston Assembly contains: Piston Body (Make), Piston Rings (Buy), Wrist Pin (Buy)
  ('automotive_precision_parts_v1', 'bom_piston_body', 'mm_piston_assy', 'piston_body', 'Make', 'mm_piston_body', 'Part', 1, 'EA'),
  ('automotive_precision_parts_v1', 'bom_piston_rings', 'mm_piston_assy', 'piston_rings', 'Buy', NULL, 'Part', 1, 'EA'),
  ('automotive_precision_parts_v1', 'bom_piston_pin', 'mm_piston_assy', 'wrist_pin', 'Buy', NULL, 'Part', 1, 'EA'),
  -- Piston Body BOM (subassembly)
  -- Piston Body contains: Aluminum Forging (Material)
  ('automotive_precision_parts_v1', 'bom_body_forging', 'mm_piston_body', 'al_forging', 'Buy', NULL, 'Material', 1, 'EA')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- METHOD OPERATIONS (routing steps)
-- ============================================================================
INSERT INTO demo_templates."methodOperation" ("templateSetId", "templateRowId", "tplMakeMethodId", "tplProcessId", "tplWorkCenterId", "order", "operationOrder", "description", "setupTime", "setupUnit", "laborTime", "laborUnit", "machineTime", "machineUnit") VALUES
  -- Robotics OEM: Robot Assembly Operations
  ('robotics_oem_parts_v1', 'op_robot_1', 'mm_robot', 'proc_assembly', 'wc_assembly', 1, 'After Previous', 'Final robot assembly', 0.5, 'Total Hours', 4.0, 'Hours/Piece', 0, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'op_robot_2', 'mm_robot', 'proc_wiring', 'wc_electronics', 2, 'After Previous', 'Electrical wiring', 0.25, 'Total Hours', 2.0, 'Hours/Piece', 0, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'op_robot_3', 'mm_robot', 'proc_testing', 'wc_test', 3, 'After Previous', 'System testing', 0.25, 'Total Hours', 2.0, 'Hours/Piece', 0, 'Hours/Piece'),
  -- Arm Assembly Operations
  ('robotics_oem_parts_v1', 'op_arm_1', 'mm_arm', 'proc_welding', 'wc_welding', 1, 'After Previous', 'Arm frame welding', 0.25, 'Total Hours', 1.0, 'Hours/Piece', 0, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'op_arm_2', 'mm_arm', 'proc_assembly', 'wc_assembly', 2, 'After Previous', 'Motor installation', 0.15, 'Total Hours', 0.75, 'Hours/Piece', 0, 'Hours/Piece'),

  -- CNC Aerospace: Bracket Operations
  ('cnc_aerospace_parts_v1', 'op_bracket_1', 'mm_bracket', 'proc_machining', 'wc_cnc_mill', 1, 'After Previous', 'CNC machining', 0.5, 'Total Hours', 0.35, 'Hours/Piece', 0.35, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_bracket_2', 'mm_bracket', 'proc_deburr', 'wc_deburr', 2, 'After Previous', 'Deburr and clean', 0, 'Total Hours', 0.15, 'Hours/Piece', 0, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_bracket_3', 'mm_bracket', 'proc_inspect', 'wc_inspect', 3, 'After Previous', 'CMM inspection', 0.1, 'Total Hours', 0.2, 'Hours/Piece', 0, 'Hours/Piece'),

  -- Metal Fabrication: Enclosure Operations
  ('metal_fabrication_parts_v1', 'op_enc_1', 'mm_enclosure', 'proc_cutting', 'wc_cutting', 1, 'After Previous', 'Cut panels', 0.15, 'Total Hours', 0.25, 'Hours/Piece', 0.25, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'op_enc_2', 'mm_enclosure', 'proc_forming', 'wc_press', 2, 'After Previous', 'Bend panels', 0.2, 'Total Hours', 0.35, 'Hours/Piece', 0.35, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'op_enc_3', 'mm_enclosure', 'proc_welding', 'wc_welding', 3, 'After Previous', 'Weld enclosure', 0.15, 'Total Hours', 0.5, 'Hours/Piece', 0, 'Hours/Piece'),

  -- Automotive Precision: Piston Assembly Operations
  ('automotive_precision_parts_v1', 'op_piston_1', 'mm_piston_assy', 'proc_assembly', 'wc_assembly', 1, 'After Previous', 'Install rings and pin', 0.1, 'Total Hours', 0.25, 'Hours/Piece', 0, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'op_piston_2', 'mm_piston_assy', 'proc_balancing', 'wc_balance', 2, 'After Previous', 'Weight matching', 0.15, 'Total Hours', 0.2, 'Hours/Piece', 0.1, 'Hours/Piece'),
  -- Piston Body Operations
  ('automotive_precision_parts_v1', 'op_body_1', 'mm_piston_body', 'proc_machining', 'wc_cnc', 1, 'After Previous', 'CNC machining piston', 0.5, 'Total Hours', 0.5, 'Hours/Piece', 0.5, 'Hours/Piece')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;
