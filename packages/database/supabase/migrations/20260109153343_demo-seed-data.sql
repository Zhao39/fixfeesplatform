-- Demo Seed Data: 4 industries × 4 modules
-- Structure per industry: Sales (3 customers, 3 items, 3 parts, 2 quotes, 3 lines),
-- Parts (6 items, 3 parts), Inventory (6 items, 6 parts), Purchasing (3 suppliers, 3 items, 3 parts, 2 POs, 3 lines)

-- Template Sets (all industries × all modules)
INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem") VALUES
  ('robotics_oem_sales_v1', 'robotics_oem', 'Sales', 1, 'robotics_oem.sales.v1', 'Robotics OEM Sales Demo', 'Demo data for robotics manufacturing sales', TRUE),
  ('robotics_oem_parts_v1', 'robotics_oem', 'Parts', 1, 'robotics_oem.parts.v1', 'Robotics OEM Parts Demo', 'Demo data for robotics parts', TRUE),
  ('robotics_oem_inventory_v1', 'robotics_oem', 'Inventory', 1, 'robotics_oem.inventory.v1', 'Robotics OEM Inventory Demo', 'Demo data for robotics inventory', TRUE),
  ('robotics_oem_purchasing_v1', 'robotics_oem', 'Purchasing', 1, 'robotics_oem.purchasing.v1', 'Robotics OEM Purchasing Demo', 'Demo data for robotics purchasing', TRUE),
  ('cnc_aerospace_sales_v1', 'cnc_aerospace', 'Sales', 1, 'cnc_aerospace.sales.v1', 'CNC Manufacturing Sales Demo', 'Demo data for CNC manufacturing sales', TRUE),
  ('cnc_aerospace_parts_v1', 'cnc_aerospace', 'Parts', 1, 'cnc_aerospace.parts.v1', 'CNC Manufacturing Parts Demo', 'Demo data for CNC manufacturing parts', TRUE),
  ('cnc_aerospace_inventory_v1', 'cnc_aerospace', 'Inventory', 1, 'cnc_aerospace.inventory.v1', 'CNC Manufacturing Inventory Demo', 'Demo data for CNC manufacturing inventory', TRUE),
  ('cnc_aerospace_purchasing_v1', 'cnc_aerospace', 'Purchasing', 1, 'cnc_aerospace.purchasing.v1', 'CNC Manufacturing Purchasing Demo', 'Demo data for CNC manufacturing purchasing', TRUE),
  ('metal_fabrication_sales_v1', 'metal_fabrication', 'Sales', 1, 'metal_fabrication.sales.v1', 'Sheet Metal Fabrication Sales Demo', 'Demo data for sheet metal fabrication sales', TRUE),
  ('metal_fabrication_parts_v1', 'metal_fabrication', 'Parts', 1, 'metal_fabrication.parts.v1', 'Sheet Metal Fabrication Parts Demo', 'Demo data for sheet metal fabrication parts', TRUE),
  ('metal_fabrication_inventory_v1', 'metal_fabrication', 'Inventory', 1, 'metal_fabrication.inventory.v1', 'Sheet Metal Fabrication Inventory Demo', 'Demo data for sheet metal fabrication inventory', TRUE),
  ('metal_fabrication_purchasing_v1', 'metal_fabrication', 'Purchasing', 1, 'metal_fabrication.purchasing.v1', 'Sheet Metal Fabrication Purchasing Demo', 'Demo data for sheet metal fabrication purchasing', TRUE),
  ('automotive_precision_sales_v1', 'automotive_precision', 'Sales', 1, 'automotive_precision.sales.v1', 'Motor Assembly Sales Demo', 'Demo data for motor assembly sales', TRUE),
  ('automotive_precision_parts_v1', 'automotive_precision', 'Parts', 1, 'automotive_precision.parts.v1', 'Motor Assembly Parts Demo', 'Demo data for motor assembly parts', TRUE),
  ('automotive_precision_inventory_v1', 'automotive_precision', 'Inventory', 1, 'automotive_precision.inventory.v1', 'Motor Assembly Inventory Demo', 'Demo data for motor assembly inventory', TRUE),
  ('automotive_precision_purchasing_v1', 'automotive_precision', 'Purchasing', 1, 'automotive_precision.purchasing.v1', 'Motor Assembly Purchasing Demo', 'Demo data for motor assembly purchasing', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- SALES MODULE: Customers
INSERT INTO demo_templates."customer" ("templateSetId", "templateRowId", "name", "taxId") VALUES
  ('robotics_oem_sales_v1', 'cust_001', 'SmartFactory Automation', '45-1234567'),
  ('robotics_oem_sales_v1', 'cust_002', 'Global Logistics Corp', '78-9876543'),
  ('robotics_oem_sales_v1', 'cust_003', 'Healthcare Robotics Solutions', '23-4567890'),
  ('cnc_aerospace_sales_v1', 'cust_001', 'AeroSpace Dynamics', '12-3456789'),
  ('cnc_aerospace_sales_v1', 'cust_002', 'Satellite Systems Inc', '98-7654321'),
  ('cnc_aerospace_sales_v1', 'cust_003', 'Defense Aviation Corp', '45-6789012'),
  ('metal_fabrication_sales_v1', 'cust_001', 'BuildRight Construction', '33-2468135'),
  ('metal_fabrication_sales_v1', 'cust_002', 'Industrial Steel Solutions', '44-1357924'),
  ('metal_fabrication_sales_v1', 'cust_003', 'Metro Infrastructure Group', '55-9876543'),
  ('automotive_precision_sales_v1', 'cust_001', 'Performance Racing Systems', '66-1122334'),
  ('automotive_precision_sales_v1', 'cust_002', 'Velocity Motorsports', '77-4455667'),
  ('automotive_precision_sales_v1', 'cust_003', 'Elite Automotive Group', '88-7788990')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- SALES MODULE: Items
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active") VALUES
  ('robotics_oem_sales_v1', 'item_001', 'HUM-R1', 'HumanoBot R1', 'Entry-level humanoid robot for warehouse automation', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_002', 'HUM-R2-PRO', 'HumanoBot R2 Pro', 'Advanced humanoid robot with AI vision system', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_sales_v1', 'item_003', 'HUM-ARM-KIT', 'Dual Arm Upgrade Kit', 'Precision dual-arm manipulation system', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_001', 'ASP-BRK-7075', 'Aluminum 7075 Bracket', 'Aerospace-grade aluminum bracket with AS9100 cert', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_002', 'ASP-TI-HSG', 'Titanium Housing Assembly', 'Ti-6Al-4V housing for satellite components', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_sales_v1', 'item_003', 'ASP-COMP-PLT', 'Carbon Composite Plate', 'CNC machined carbon fiber composite plate', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fabrication_sales_v1', 'item_001', 'TF-BEAM-W12', 'W12x26 Steel I-Beam', 'Structural steel I-beam, 20ft length', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fabrication_sales_v1', 'item_002', 'TF-TRUSS-CUST', 'Custom Steel Truss', 'Welded steel truss assembly per spec', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fabrication_sales_v1', 'item_003', 'TF-PLATE-BASE', 'Steel Base Plate', 'Heavy-duty base plate with anchor holes', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('automotive_precision_sales_v1', 'item_001', 'APX-PISTON-HP', 'High-Performance Piston Set', 'Forged aluminum pistons for racing engines', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('automotive_precision_sales_v1', 'item_002', 'APX-CRANK-TI', 'Titanium Crankshaft', 'Precision-balanced titanium crankshaft', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('automotive_precision_sales_v1', 'item_003', 'APX-VALVE-SS', 'Stainless Valve Set', 'High-temp stainless steel valve set', 'Part', 'Inventory', 'Make', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- SALES MODULE: Parts (for sales items)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate") VALUES
  ('robotics_oem_sales_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('robotics_oem_sales_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('robotics_oem_sales_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('cnc_aerospace_sales_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('cnc_aerospace_sales_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('cnc_aerospace_sales_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('metal_fabrication_sales_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('metal_fabrication_sales_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('metal_fabrication_sales_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('automotive_precision_sales_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('automotive_precision_sales_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('automotive_precision_sales_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '90 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- SALES MODULE: Quotes
INSERT INTO demo_templates."quote" ("templateSetId", "templateRowId", "quoteId", "tplCustomerId", "status", "expirationDate", "customerReference") VALUES
  ('robotics_oem_sales_v1', 'quote_001', 'Q-2025-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('robotics_oem_sales_v1', 'quote_002', 'Q-2025-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-002'),
  ('cnc_aerospace_sales_v1', 'quote_001', 'Q-ASP-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('cnc_aerospace_sales_v1', 'quote_002', 'Q-ASP-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-002'),
  ('metal_fabrication_sales_v1', 'quote_001', 'Q-TF-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('metal_fabrication_sales_v1', 'quote_002', 'Q-TF-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-002'),
  ('automotive_precision_sales_v1', 'quote_001', 'Q-APX-001', 'cust_001', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-001'),
  ('automotive_precision_sales_v1', 'quote_002', 'Q-APX-002', 'cust_002', 'Draft', CURRENT_DATE + INTERVAL '30 days', 'CUST-REF-002')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- SALES MODULE: Quote Lines
INSERT INTO demo_templates."quoteLine" ("templateSetId", "templateRowId", "tplQuoteId", "tplItemId", "description", "quantity", "unitPrice") VALUES
  ('robotics_oem_sales_v1', 'qline_001', 'quote_001', 'item_001', 'HumanoBot R1 - Standard Config', 5, 85000.00),
  ('robotics_oem_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Dual Arm Upgrade Kit', 5, 35000.00),
  ('robotics_oem_sales_v1', 'qline_003', 'quote_002', 'item_002', 'HumanoBot R2 Pro - Full AI Suite', 3, 145000.00),
  ('cnc_aerospace_sales_v1', 'qline_001', 'quote_001', 'item_001', 'Aluminum 7075 Bracket - AS9100', 250, 125.00),
  ('cnc_aerospace_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Carbon Composite Plate', 100, 450.00),
  ('cnc_aerospace_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Titanium Housing Assembly', 50, 875.00),
  ('metal_fabrication_sales_v1', 'qline_001', 'quote_001', 'item_001', 'W12x26 Steel I-Beam - 20ft', 50, 285.00),
  ('metal_fabrication_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Steel Base Plate - Heavy Duty', 50, 125.00),
  ('metal_fabrication_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Custom Steel Truss - Per Drawing', 12, 1850.00),
  ('automotive_precision_sales_v1', 'qline_001', 'quote_001', 'item_001', 'High-Performance Piston Set', 10, 2850.00),
  ('automotive_precision_sales_v1', 'qline_002', 'quote_001', 'item_003', 'Stainless Valve Set - High Temp', 10, 1250.00),
  ('automotive_precision_sales_v1', 'qline_003', 'quote_002', 'item_002', 'Titanium Crankshaft - Balanced', 5, 8500.00)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PARTS MODULE: Items (assemblies + components)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active") VALUES
  ('robotics_oem_parts_v1', 'item_a001', 'ROB-ARM-6DOF', '6-Axis Robot Arm', 'Complete 6-axis robotic arm assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_a002', 'ROB-BASE-001', 'Robot Base Assembly', 'Robot base with mounting plate', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_a003', 'ROB-JOINT-1', 'Joint 1 Assembly', 'Base rotation joint assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_c001', 'ROB-MOTOR-1', 'Servo Motor 1kW', '1kW AC servo motor', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_c002', 'ROB-ENCODER-001', 'Absolute Encoder', 'High-resolution absolute encoder', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_parts_v1', 'item_c003', 'ROB-GEARBOX-001', 'Harmonic Gearbox 100:1', '100:1 ratio harmonic drive gearbox', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_a001', 'FG-BRK-100', 'Aluminum Bracket Assembly', 'Complete bracket assembly with hardware', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_a002', 'FG-HSG-200', 'Titanium Housing Assembly', 'Complete housing with seals and fasteners', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_a003', 'FG-SFT-300', 'Shaft Assembly', 'Complete shaft assembly with bearings', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_c001', 'PC-SCREW-M6', 'M6 Socket Head Screw', 'M6x20mm socket head cap screw', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_c002', 'PC-WASHER-M6', 'M6 Washer', 'M6 flat washer', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_parts_v1', 'item_c003', 'PC-SEAL-001', 'O-Ring Seal 50mm', '50mm diameter Viton O-ring', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_a001', 'PROD-001', 'Standard Widget', 'Standard production widget', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_a002', 'PROD-002', 'Premium Widget', 'Premium quality widget', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_a003', 'ASSY-001', 'Widget Assembly', 'Complete widget assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_c001', 'COMP-BASE', 'Widget Base', 'Base component for widget', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_c002', 'COMP-TOP', 'Widget Top', 'Top component for widget', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_parts_v1', 'item_c003', 'COMP-SPRING', 'Spring Component', 'Spring for widget assembly', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_a001', 'ENG-PISTON-ASY', 'Piston Assembly', 'Complete piston assembly with rings and pin', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_a002', 'ENG-CRANK-ASY', 'Crankshaft Assembly', 'Balanced crankshaft with bearings', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_a003', 'ENG-VALVE-ASY', 'Valve Train Assembly', 'Complete valve train assembly', 'Part', 'Inventory', 'Make', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_c001', 'CMP-RING-SET', 'Piston Ring Set', 'High-performance piston ring set', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_c002', 'CMP-BEARING-RD', 'Rod Bearing Set', 'Connecting rod bearing set', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_parts_v1', 'item_c003', 'CMP-SPRING-VLV', 'Valve Spring Set', 'High-lift valve spring set', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PARTS MODULE: Parts (for assemblies only)
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate") VALUES
  ('robotics_oem_parts_v1', 'item_a001', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('robotics_oem_parts_v1', 'item_a002', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('robotics_oem_parts_v1', 'item_a003', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('cnc_aerospace_parts_v1', 'item_a001', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('cnc_aerospace_parts_v1', 'item_a002', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('cnc_aerospace_parts_v1', 'item_a003', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('metal_fabrication_parts_v1', 'item_a001', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('metal_fabrication_parts_v1', 'item_a002', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('metal_fabrication_parts_v1', 'item_a003', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('automotive_precision_parts_v1', 'item_a001', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('automotive_precision_parts_v1', 'item_a002', TRUE, CURRENT_DATE - INTERVAL '90 days'),
  ('automotive_precision_parts_v1', 'item_a003', TRUE, CURRENT_DATE - INTERVAL '90 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- INVENTORY MODULE: Items
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active") VALUES
  ('robotics_oem_inventory_v1', 'item_i001', 'EL-PLC-001', 'PLC Controller', 'Industrial PLC with I/O modules', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_i002', 'EL-DRIVE-001', 'Servo Drive 3kW', '3kW servo motor drive', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_i003', 'EL-SENSOR-VIS', 'Vision Sensor', '2D vision sensor with LED illumination', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_i004', 'MC-BEARING-6205', 'Ball Bearing 6205', '6205 deep groove ball bearing', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_i005', 'MC-BELT-GT2', 'Timing Belt GT2', 'GT2 timing belt 6mm width', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'item_i006', 'MC-PULLEY-GT2', 'Timing Pulley GT2 20T', 'GT2 timing pulley 20 teeth', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i001', 'RM-AL-6061-1', 'Aluminum 6061 Bar 1"', '1" diameter 6061 aluminum bar stock', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i002', 'RM-TI-GR5-1', 'Titanium Grade 5 Bar 1"', '1" diameter Ti-6Al-4V bar stock', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i003', 'RM-SS-304-1', 'Stainless Steel 304 Bar 1"', '1" diameter 304 stainless bar', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i004', 'TL-EM-0250', 'Carbide End Mill 1/4"', '1/4" 4-flute carbide end mill', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i005', 'TL-EM-0500', 'Carbide End Mill 1/2"', '1/2" 4-flute carbide end mill', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'item_i006', 'TL-DR-SET-1', 'Drill Bit Set HSS', 'HSS drill bit set 1/16" to 1/2"', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i001', 'RM-STEEL-SHEET', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i002', 'RM-PLASTIC-ABS', 'ABS Plastic Sheet', '1/8" ABS plastic sheet', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i003', 'RM-WOOD-PLY', 'Plywood 3/4"', '3/4" birch plywood', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i004', 'HW-SCREW-M4', 'M4x12mm Screw', 'M4x12mm pan head screw', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i005', 'HW-SCREW-M6', 'M6x20mm Screw', 'M6x20mm socket head screw', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'item_i006', 'HW-NUT-M6', 'M6 Hex Nut', 'M6 hex nut', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i001', 'INV-GASKET-HD', 'Head Gasket Set', 'Multi-layer steel head gasket set', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i002', 'INV-SEAL-CRK', 'Crankshaft Seal Kit', 'Complete crankshaft seal kit', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i003', 'INV-BOLT-HEAD', 'Head Bolt Set', 'High-strength head bolt set', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i004', 'INV-STUD-EXH', 'Exhaust Stud Kit', 'Stainless exhaust manifold stud kit', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i005', 'INV-DOWEL-PIN', 'Dowel Pin Set', 'Precision dowel pin set', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'item_i006', 'INV-WASHER-TH', 'Thrust Washer Set', 'Crankshaft thrust washer set', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- INVENTORY MODULE: Parts
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate") VALUES
  ('robotics_oem_inventory_v1', 'item_i001', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_inventory_v1', 'item_i002', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_inventory_v1', 'item_i003', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_inventory_v1', 'item_i004', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_inventory_v1', 'item_i005', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_inventory_v1', 'item_i006', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_inventory_v1', 'item_i001', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_inventory_v1', 'item_i002', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_inventory_v1', 'item_i003', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_inventory_v1', 'item_i004', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_inventory_v1', 'item_i005', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_inventory_v1', 'item_i006', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_inventory_v1', 'item_i001', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_inventory_v1', 'item_i002', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_inventory_v1', 'item_i003', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_inventory_v1', 'item_i004', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_inventory_v1', 'item_i005', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_inventory_v1', 'item_i006', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_inventory_v1', 'item_i001', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_inventory_v1', 'item_i002', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_inventory_v1', 'item_i003', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_inventory_v1', 'item_i004', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_inventory_v1', 'item_i005', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_inventory_v1', 'item_i006', TRUE, CURRENT_DATE - INTERVAL '30 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PURCHASING MODULE: Suppliers
INSERT INTO demo_templates."supplier" ("templateSetId", "templateRowId", "name", "taxId") VALUES
  ('robotics_oem_purchasing_v1', 'supp_001', 'Precision Motors Inc', '12-3456789'),
  ('robotics_oem_purchasing_v1', 'supp_002', 'Advanced Electronics Supply', '23-4567890'),
  ('robotics_oem_purchasing_v1', 'supp_003', 'Robotic Components Co', '34-5678901'),
  ('cnc_aerospace_purchasing_v1', 'supp_001', 'Aerospace Metals Supply', '11-2233445'),
  ('cnc_aerospace_purchasing_v1', 'supp_002', 'Precision Tooling Co', '22-3344556'),
  ('cnc_aerospace_purchasing_v1', 'supp_003', 'Aerospace Fasteners Inc', '33-4455667'),
  ('metal_fabrication_purchasing_v1', 'supp_001', 'Steel Supply Co', '44-5566778'),
  ('metal_fabrication_purchasing_v1', 'supp_002', 'Industrial Hardware Supply', '55-6677889'),
  ('metal_fabrication_purchasing_v1', 'supp_003', 'Welding Supplies Inc', '66-7788990'),
  ('automotive_precision_purchasing_v1', 'supp_001', 'Precision Metals Supply', '77-8899001'),
  ('automotive_precision_purchasing_v1', 'supp_002', 'Racing Components Inc', '88-9900112'),
  ('automotive_precision_purchasing_v1', 'supp_003', 'Performance Fasteners Co', '99-0011223')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PURCHASING MODULE: Items
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active") VALUES
  ('robotics_oem_purchasing_v1', 'item_001', 'PRT-SERVO-1KW', 'Servo Motor 1kW', '1kW AC servo motor for robot joints', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'item_002', 'PRT-ENCODER-ABS', 'Absolute Encoder', 'High-resolution absolute encoder', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'item_003', 'PRT-GEARBOX-100', 'Harmonic Gearbox 100:1', '100:1 ratio harmonic drive', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_001', 'PRT-AL-6061-BAR', 'Aluminum 6061 Bar 2"', '2" diameter 6061 aluminum bar stock', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_002', 'PRT-TI-GR5-BAR', 'Titanium Grade 5 Bar 1"', '1" diameter Ti-6Al-4V bar stock', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_purchasing_v1', 'item_003', 'PRT-EM-CARB', 'Carbide End Mill 1/2"', '1/2" 4-flute carbide end mill', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_001', 'PRT-STEEL-SHEET', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_002', 'PRT-STEEL-BEAM', 'W12x26 Steel I-Beam', 'W12x26 structural steel I-beam', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_purchasing_v1', 'item_003', 'PRT-WELD-ROD', 'Welding Rod 7018', '7018 welding electrode', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'item_001', 'PRT-AL-FORGED', 'Forged Aluminum Blank', 'Forged aluminum blank for pistons', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'item_002', 'PRT-TI-BAR', 'Titanium Bar 1"', '1" diameter titanium bar for crankshaft', 'Part', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'item_003', 'PRT-SS-VALVE', 'Stainless Valve Blank', 'Stainless steel valve blank', 'Part', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PURCHASING MODULE: Parts
INSERT INTO demo_templates."part" ("templateSetId", "templateRowId", "approved", "fromDate") VALUES
  ('robotics_oem_purchasing_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_purchasing_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('robotics_oem_purchasing_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_purchasing_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_purchasing_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('cnc_aerospace_purchasing_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_purchasing_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_purchasing_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('metal_fabrication_purchasing_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_purchasing_v1', 'item_001', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_purchasing_v1', 'item_002', TRUE, CURRENT_DATE - INTERVAL '30 days'),
  ('automotive_precision_purchasing_v1', 'item_003', TRUE, CURRENT_DATE - INTERVAL '30 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PURCHASING MODULE: Purchase Orders
INSERT INTO demo_templates."purchaseOrder" ("templateSetId", "templateRowId", "purchaseOrderId", "tplSupplierId", "purchaseOrderType", "status", "orderDate", "receiptPromisedDate", "receiptRequestedDate") VALUES
  ('robotics_oem_purchasing_v1', 'po_001', 'PO-2025-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'po_002', 'PO-2025-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days'),
  ('cnc_aerospace_purchasing_v1', 'po_001', 'PO-ASP-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'po_002', 'PO-ASP-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days'),
  ('metal_fabrication_purchasing_v1', 'po_001', 'PO-TF-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('metal_fabrication_purchasing_v1', 'po_002', 'PO-TF-002', 'supp_003', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days'),
  ('automotive_precision_purchasing_v1', 'po_001', 'PO-APX-001', 'supp_001', 'Purchase', 'To Receive', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'po_002', 'PO-APX-002', 'supp_002', 'Purchase', 'Draft', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PURCHASING MODULE: Purchase Order Lines
INSERT INTO demo_templates."purchaseOrderLine" ("templateSetId", "templateRowId", "tplPurchaseOrderId", "tplItemId", "description", "quantity", "unitPrice", "receiptPromisedDate", "receiptRequestedDate") VALUES
  ('robotics_oem_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Servo Motor 1kW - Standard', 20, 850.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Absolute Encoder - High Res', 20, 450.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('robotics_oem_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Harmonic Gearbox 100:1', 15, 1250.00, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Aluminum 6061 Bar 2" - Aerospace Grade', 500, 8.50, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Titanium Grade 5 Bar 1"', 200, 45.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('cnc_aerospace_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Carbide End Mill 1/2" - Premium', 25, 125.00, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days'),
  ('metal_fabrication_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Steel Sheet 16GA - Cold Rolled', 2000, 2.85, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('metal_fabrication_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'W12x26 Steel I-Beam - 20ft', 50, 285.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('metal_fabrication_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Welding Rod 7018 - 50lb', 200, 4.25, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days'),
  ('automotive_precision_purchasing_v1', 'poline_001', 'po_001', 'item_001', 'Forged Aluminum Blank - Racing Grade', 50, 125.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'poline_002', 'po_001', 'item_002', 'Titanium Bar 1" - High Grade', 100, 85.00, CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '10 days'),
  ('automotive_precision_purchasing_v1', 'poline_003', 'po_002', 'item_003', 'Stainless Valve Blank - High Temp', 200, 8.50, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '25 days')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- INVENTORY MODULE: Material-type Items (raw materials)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active") VALUES
  -- Robotics OEM - Raw materials
  ('robotics_oem_inventory_v1', 'mat_001', 'MAT-AL-6061-RD', 'Aluminum 6061 Round Bar', '1" diameter 6061-T6 aluminum round bar', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'mat_002', 'MAT-STEEL-4140', 'Steel 4140 Round Bar', '2" diameter 4140 steel round bar', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_inventory_v1', 'mat_003', 'MAT-BRASS-360', 'Brass 360 Round Bar', '1" diameter 360 brass round bar', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  -- CNC Aerospace - Raw materials
  ('cnc_aerospace_inventory_v1', 'mat_001', 'MAT-AL-7075-PLT', 'Aluminum 7075 Plate', '1" thick 7075-T651 aluminum plate', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'mat_002', 'MAT-TI-GR5-RD', 'Titanium Grade 5 Round Bar', '2" diameter Ti-6Al-4V round bar', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_inventory_v1', 'mat_003', 'MAT-SS-316-SHT', 'Stainless 316 Sheet', '0.125" thick 316 stainless sheet', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  -- Metal Fabrication - Raw materials
  ('metal_fabrication_inventory_v1', 'mat_001', 'MAT-STEEL-HR-PLT', 'Hot Rolled Steel Plate', '0.5" thick A36 hot rolled plate', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'mat_002', 'MAT-STEEL-CR-SHT', 'Cold Rolled Steel Sheet', '16GA cold rolled steel sheet', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_inventory_v1', 'mat_003', 'MAT-AL-5052-SHT', 'Aluminum 5052 Sheet', '0.125" thick 5052-H32 aluminum sheet', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  -- Automotive Precision - Raw materials
  ('automotive_precision_inventory_v1', 'mat_001', 'MAT-AL-FORGED', 'Forged Aluminum Billet', '4" diameter 2618-T61 forged aluminum', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'mat_002', 'MAT-TI-BILLET', 'Titanium Billet', '3" diameter Ti-6Al-4V billet', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_inventory_v1', 'mat_003', 'MAT-SS-17-4', 'Stainless 17-4 PH Round Bar', '1.5" diameter 17-4 PH stainless bar', 'Material', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PURCHASING MODULE: Material-type Items (raw materials for purchase)
INSERT INTO demo_templates."item" ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active") VALUES
  -- Robotics OEM - Purchased materials
  ('robotics_oem_purchasing_v1', 'mat_001', 'MAT-AL-RD-1IN', 'Aluminum Round Bar 1"', '1" diameter 6061-T6 aluminum bar stock', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('robotics_oem_purchasing_v1', 'mat_002', 'MAT-STEEL-RD-2IN', 'Steel Round Bar 2"', '2" diameter 4140 alloy steel bar', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  -- CNC Aerospace - Purchased materials
  ('cnc_aerospace_purchasing_v1', 'mat_001', 'MAT-AL-7075-BAR', 'Aluminum 7075 Bar Stock', '2" diameter 7075-T651 aluminum', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('cnc_aerospace_purchasing_v1', 'mat_002', 'MAT-TI-GR5-BAR', 'Titanium Grade 5 Bar', '1.5" diameter Ti-6Al-4V bar', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  -- Metal Fabrication - Purchased materials
  ('metal_fabrication_purchasing_v1', 'mat_001', 'MAT-STEEL-PLT-HR', 'Steel Plate Hot Rolled', 'A36 hot rolled steel plate', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('metal_fabrication_purchasing_v1', 'mat_002', 'MAT-STEEL-SHT-CR', 'Steel Sheet Cold Rolled', '16GA cold rolled steel sheet', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  -- Automotive Precision - Purchased materials
  ('automotive_precision_purchasing_v1', 'mat_001', 'MAT-AL-FORG-BLK', 'Forged Aluminum Blank', '4" diameter 2618-T61 forging blank', 'Material', 'Inventory', 'Buy', 'EA', TRUE),
  ('automotive_precision_purchasing_v1', 'mat_002', 'MAT-TI-BAR-3IN', 'Titanium Bar 3"', '3" diameter Ti-6Al-4V bar stock', 'Material', 'Inventory', 'Buy', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- INVENTORY MODULE: Material records (links Material-type items to materialForm/materialSubstance)
INSERT INTO demo_templates."material" ("templateSetId", "templateRowId", "materialFormName", "materialSubstanceName", "approved") VALUES
  -- Robotics OEM
  ('robotics_oem_inventory_v1', 'mat_001', 'Round Bar', 'Aluminum', TRUE),
  ('robotics_oem_inventory_v1', 'mat_002', 'Round Bar', 'Steel', TRUE),
  ('robotics_oem_inventory_v1', 'mat_003', 'Round Bar', 'Brass', TRUE),
  -- CNC Aerospace
  ('cnc_aerospace_inventory_v1', 'mat_001', 'Plate', 'Aluminum', TRUE),
  ('cnc_aerospace_inventory_v1', 'mat_002', 'Round Bar', 'Titanium', TRUE),
  ('cnc_aerospace_inventory_v1', 'mat_003', 'Sheet', 'Stainless Steel', TRUE),
  -- Metal Fabrication
  ('metal_fabrication_inventory_v1', 'mat_001', 'Plate', 'Steel', TRUE),
  ('metal_fabrication_inventory_v1', 'mat_002', 'Sheet', 'Steel', TRUE),
  ('metal_fabrication_inventory_v1', 'mat_003', 'Sheet', 'Aluminum', TRUE),
  -- Automotive Precision
  ('automotive_precision_inventory_v1', 'mat_001', 'Billet', 'Aluminum', TRUE),
  ('automotive_precision_inventory_v1', 'mat_002', 'Billet', 'Titanium', TRUE),
  ('automotive_precision_inventory_v1', 'mat_003', 'Round Bar', 'Stainless Steel', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PURCHASING MODULE: Material records
INSERT INTO demo_templates."material" ("templateSetId", "templateRowId", "materialFormName", "materialSubstanceName", "approved") VALUES
  -- Robotics OEM
  ('robotics_oem_purchasing_v1', 'mat_001', 'Round Bar', 'Aluminum', TRUE),
  ('robotics_oem_purchasing_v1', 'mat_002', 'Round Bar', 'Steel', TRUE),
  -- CNC Aerospace
  ('cnc_aerospace_purchasing_v1', 'mat_001', 'Round Bar', 'Aluminum', TRUE),
  ('cnc_aerospace_purchasing_v1', 'mat_002', 'Round Bar', 'Titanium', TRUE),
  -- Metal Fabrication
  ('metal_fabrication_purchasing_v1', 'mat_001', 'Plate', 'Steel', TRUE),
  ('metal_fabrication_purchasing_v1', 'mat_002', 'Sheet', 'Steel', TRUE),
  -- Automotive Precision
  ('automotive_precision_purchasing_v1', 'mat_001', 'Billet', 'Aluminum', TRUE),
  ('automotive_precision_purchasing_v1', 'mat_002', 'Round Bar', 'Titanium', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- ============================================================================
-- MANUFACTURING DATA: Work Centers, Processes, BOMs, and Operations
-- ============================================================================

-- PARTS MODULE: Work Centers
-- machineRate + overheadRate + laborRate = total hourly rate
INSERT INTO demo_templates."workCenter" ("templateSetId", "templateRowId", "name", "description", "machineRate", "overheadRate", "laborRate", "defaultStandardFactor") VALUES
  -- Robotics OEM
  ('robotics_oem_parts_v1', 'wc_assembly', 'Assembly Line', 'Main robot assembly line', 25.00, 25.00, 75.00, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'wc_welding', 'Welding Station', 'TIG/MIG welding station', 35.00, 30.00, 85.00, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'wc_electronics', 'Electronics Lab', 'Electronics assembly and wiring', 30.00, 25.00, 80.00, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'wc_test', 'Test Chamber', 'Robot testing and calibration', 45.00, 35.00, 95.00, 'Hours/Piece'),
  -- CNC Aerospace
  ('cnc_aerospace_parts_v1', 'wc_cnc_mill', 'CNC Mill 1', 'Haas VF-4 vertical machining center', 75.00, 45.00, 65.00, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'wc_cnc_lathe', 'CNC Lathe 1', 'Mazak turning center', 70.00, 45.00, 60.00, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'wc_inspect', 'Inspection Bay', 'CMM and quality inspection', 40.00, 30.00, 55.00, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'wc_deburr', 'Deburr Station', 'Manual deburring and finishing', 20.00, 20.00, 45.00, 'Hours/Piece'),
  -- Metal Fabrication
  ('metal_fabrication_parts_v1', 'wc_cutting', 'Cutting Table', 'Plasma/laser cutting table', 55.00, 35.00, 55.00, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'wc_welding', 'Welding Bay', 'MIG/TIG welding station', 40.00, 30.00, 65.00, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'wc_press', 'Press Brake', 'CNC press brake', 60.00, 35.00, 60.00, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'wc_finish', 'Finish Area', 'Grinding, deburring, painting', 25.00, 25.00, 45.00, 'Hours/Piece'),
  -- Automotive Precision
  ('automotive_precision_parts_v1', 'wc_cnc', 'CNC Machining Center', '5-axis CNC machining', 80.00, 45.00, 70.00, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'wc_assembly', 'Assembly Bench', 'Precision assembly station', 30.00, 30.00, 65.00, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'wc_balance', 'Balancing Machine', 'Dynamic balancing equipment', 55.00, 35.00, 75.00, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'wc_dyno', 'Dyno Room', 'Engine testing dynamometer', 85.00, 45.00, 95.00, 'Hours/Piece')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PARTS MODULE: Processes
INSERT INTO demo_templates."process" ("templateSetId", "templateRowId", "name", "defaultStandardFactor") VALUES
  -- Robotics OEM
  ('robotics_oem_parts_v1', 'proc_assembly', 'Assembly', 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'proc_welding', 'Welding', 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'proc_wiring', 'Wiring', 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'proc_programming', 'Programming', 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'proc_testing', 'Testing', 'Hours/Piece'),
  -- CNC Aerospace
  ('cnc_aerospace_parts_v1', 'proc_programming', 'Programming', 'Total Hours'),
  ('cnc_aerospace_parts_v1', 'proc_op1', 'OP1 - Rough', 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'proc_op2', 'OP2 - Finish', 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'proc_inspect', 'Inspect', 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'proc_deburr', 'Deburr', 'Hours/Piece'),
  -- Metal Fabrication
  ('metal_fabrication_parts_v1', 'proc_cutting', 'Cutting', 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'proc_welding', 'Welding', 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'proc_forming', 'Forming', 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'proc_finishing', 'Finishing', 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'proc_assembly', 'Assembly', 'Hours/Piece'),
  -- Automotive Precision
  ('automotive_precision_parts_v1', 'proc_machining', 'Machining', 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'proc_assembly', 'Assembly', 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'proc_balancing', 'Balancing', 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'proc_testing', 'Testing', 'Hours/Piece')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PARTS MODULE: Work Center Process Mappings
INSERT INTO demo_templates."workCenterProcess" ("templateSetId", "tplWorkCenterId", "tplProcessId") VALUES
  -- Robotics OEM
  ('robotics_oem_parts_v1', 'wc_assembly', 'proc_assembly'),
  ('robotics_oem_parts_v1', 'wc_welding', 'proc_welding'),
  ('robotics_oem_parts_v1', 'wc_electronics', 'proc_wiring'),
  ('robotics_oem_parts_v1', 'wc_electronics', 'proc_programming'),
  ('robotics_oem_parts_v1', 'wc_test', 'proc_testing'),
  -- CNC Aerospace
  ('cnc_aerospace_parts_v1', 'wc_cnc_mill', 'proc_programming'),
  ('cnc_aerospace_parts_v1', 'wc_cnc_mill', 'proc_op1'),
  ('cnc_aerospace_parts_v1', 'wc_cnc_mill', 'proc_op2'),
  ('cnc_aerospace_parts_v1', 'wc_cnc_lathe', 'proc_op1'),
  ('cnc_aerospace_parts_v1', 'wc_cnc_lathe', 'proc_op2'),
  ('cnc_aerospace_parts_v1', 'wc_inspect', 'proc_inspect'),
  ('cnc_aerospace_parts_v1', 'wc_deburr', 'proc_deburr'),
  -- Metal Fabrication
  ('metal_fabrication_parts_v1', 'wc_cutting', 'proc_cutting'),
  ('metal_fabrication_parts_v1', 'wc_welding', 'proc_welding'),
  ('metal_fabrication_parts_v1', 'wc_press', 'proc_forming'),
  ('metal_fabrication_parts_v1', 'wc_finish', 'proc_finishing'),
  ('metal_fabrication_parts_v1', 'wc_finish', 'proc_assembly'),
  -- Automotive Precision
  ('automotive_precision_parts_v1', 'wc_cnc', 'proc_machining'),
  ('automotive_precision_parts_v1', 'wc_assembly', 'proc_assembly'),
  ('automotive_precision_parts_v1', 'wc_balance', 'proc_balancing'),
  ('automotive_precision_parts_v1', 'wc_dyno', 'proc_testing')
ON CONFLICT ("templateSetId", "tplWorkCenterId", "tplProcessId") DO NOTHING;

-- PARTS MODULE: Make Methods (for assembly items)
INSERT INTO demo_templates."makeMethod" ("templateSetId", "templateRowId", "tplItemId") VALUES
  -- Robotics OEM: Nested BOM structure
  ('robotics_oem_parts_v1', 'mm_arm', 'item_a001'),      -- 6-Axis Robot Arm
  ('robotics_oem_parts_v1', 'mm_base', 'item_a002'),     -- Robot Base Assembly
  ('robotics_oem_parts_v1', 'mm_joint1', 'item_a003'),   -- Joint 1 Assembly
  -- CNC Aerospace: Flat BOM with operations
  ('cnc_aerospace_parts_v1', 'mm_bracket', 'item_a001'),  -- Aluminum Bracket Assembly
  ('cnc_aerospace_parts_v1', 'mm_housing', 'item_a002'),  -- Titanium Housing Assembly
  ('cnc_aerospace_parts_v1', 'mm_shaft', 'item_a003'),    -- Shaft Assembly
  -- Metal Fabrication
  ('metal_fabrication_parts_v1', 'mm_widget1', 'item_a001'),  -- Standard Widget
  ('metal_fabrication_parts_v1', 'mm_widget2', 'item_a002'),  -- Premium Widget
  ('metal_fabrication_parts_v1', 'mm_assy', 'item_a003'),     -- Widget Assembly
  -- Automotive Precision
  ('automotive_precision_parts_v1', 'mm_piston', 'item_a001'),  -- Piston Assembly
  ('automotive_precision_parts_v1', 'mm_crank', 'item_a002'),   -- Crankshaft Assembly
  ('automotive_precision_parts_v1', 'mm_valve', 'item_a003')    -- Valve Train Assembly
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PARTS MODULE: Method Materials (BOM components)
INSERT INTO demo_templates."methodMaterial" ("templateSetId", "templateRowId", "tplMakeMethodId", "tplItemId", "methodType", "tplMaterialMakeMethodId", "quantity", "unitOfMeasureCode") VALUES
  -- Robotics OEM: 6-Axis Robot Arm has nested sub-assemblies
  ('robotics_oem_parts_v1', 'mat_arm_base', 'mm_arm', 'item_a002', 'Make', 'mm_base', 1, 'EA'),
  ('robotics_oem_parts_v1', 'mat_arm_joint', 'mm_arm', 'item_a003', 'Make', 'mm_joint1', 6, 'EA'),
  -- Robot Base Assembly has bought components
  ('robotics_oem_parts_v1', 'mat_base_motor', 'mm_base', 'item_c001', 'Buy', NULL, 1, 'EA'),
  ('robotics_oem_parts_v1', 'mat_base_encoder', 'mm_base', 'item_c002', 'Buy', NULL, 1, 'EA'),
  -- Joint 1 Assembly has bought components
  ('robotics_oem_parts_v1', 'mat_joint_motor', 'mm_joint1', 'item_c001', 'Buy', NULL, 1, 'EA'),
  ('robotics_oem_parts_v1', 'mat_joint_encoder', 'mm_joint1', 'item_c002', 'Buy', NULL, 1, 'EA'),
  ('robotics_oem_parts_v1', 'mat_joint_gearbox', 'mm_joint1', 'item_c003', 'Buy', NULL, 1, 'EA'),

  -- CNC Aerospace: Flat BOM with raw material
  ('cnc_aerospace_parts_v1', 'mat_brk_screw', 'mm_bracket', 'item_c001', 'Buy', NULL, 8, 'EA'),
  ('cnc_aerospace_parts_v1', 'mat_brk_washer', 'mm_bracket', 'item_c002', 'Buy', NULL, 8, 'EA'),
  ('cnc_aerospace_parts_v1', 'mat_hsg_screw', 'mm_housing', 'item_c001', 'Buy', NULL, 12, 'EA'),
  ('cnc_aerospace_parts_v1', 'mat_hsg_seal', 'mm_housing', 'item_c003', 'Buy', NULL, 2, 'EA'),
  ('cnc_aerospace_parts_v1', 'mat_sft_screw', 'mm_shaft', 'item_c001', 'Buy', NULL, 4, 'EA'),
  ('cnc_aerospace_parts_v1', 'mat_sft_washer', 'mm_shaft', 'item_c002', 'Buy', NULL, 4, 'EA'),

  -- Metal Fabrication
  ('metal_fabrication_parts_v1', 'mat_w1_base', 'mm_widget1', 'item_c001', 'Buy', NULL, 1, 'EA'),
  ('metal_fabrication_parts_v1', 'mat_w1_top', 'mm_widget1', 'item_c002', 'Buy', NULL, 1, 'EA'),
  ('metal_fabrication_parts_v1', 'mat_w2_base', 'mm_widget2', 'item_c001', 'Buy', NULL, 1, 'EA'),
  ('metal_fabrication_parts_v1', 'mat_w2_top', 'mm_widget2', 'item_c002', 'Buy', NULL, 1, 'EA'),
  ('metal_fabrication_parts_v1', 'mat_w2_spring', 'mm_widget2', 'item_c003', 'Buy', NULL, 2, 'EA'),
  ('metal_fabrication_parts_v1', 'mat_assy_w1', 'mm_assy', 'item_a001', 'Make', 'mm_widget1', 1, 'EA'),
  ('metal_fabrication_parts_v1', 'mat_assy_w2', 'mm_assy', 'item_a002', 'Make', 'mm_widget2', 1, 'EA'),

  -- Automotive Precision
  ('automotive_precision_parts_v1', 'mat_pis_ring', 'mm_piston', 'item_c001', 'Buy', NULL, 1, 'EA'),
  ('automotive_precision_parts_v1', 'mat_crk_bearing', 'mm_crank', 'item_c002', 'Buy', NULL, 1, 'EA'),
  ('automotive_precision_parts_v1', 'mat_vlv_spring', 'mm_valve', 'item_c003', 'Buy', NULL, 1, 'EA')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- PARTS MODULE: Method Operations (routing steps)
INSERT INTO demo_templates."methodOperation" ("templateSetId", "templateRowId", "tplMakeMethodId", "tplProcessId", "tplWorkCenterId", "order", "operationOrder", "description", "setupTime", "setupUnit", "laborTime", "laborUnit", "machineTime", "machineUnit") VALUES
  -- Robotics OEM: 6-Axis Robot Arm
  ('robotics_oem_parts_v1', 'op_arm_1', 'mm_arm', 'proc_assembly', 'wc_assembly', 1, 'After Previous', 'Final arm assembly', 0.5, 'Total Hours', 4.0, 'Hours/Piece', 0, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'op_arm_2', 'mm_arm', 'proc_wiring', 'wc_electronics', 2, 'After Previous', 'Electrical wiring and connections', 0.25, 'Total Hours', 2.0, 'Hours/Piece', 0, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'op_arm_3', 'mm_arm', 'proc_programming', 'wc_electronics', 3, 'After Previous', 'Controller programming', 0.5, 'Total Hours', 1.5, 'Hours/Piece', 0, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'op_arm_4', 'mm_arm', 'proc_testing', 'wc_test', 4, 'After Previous', 'Full system testing and calibration', 0.25, 'Total Hours', 2.0, 'Hours/Piece', 0, 'Hours/Piece'),
  -- Robot Base Assembly
  ('robotics_oem_parts_v1', 'op_base_1', 'mm_base', 'proc_welding', 'wc_welding', 1, 'After Previous', 'Base frame welding', 0.5, 'Total Hours', 1.5, 'Hours/Piece', 0, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'op_base_2', 'mm_base', 'proc_assembly', 'wc_assembly', 2, 'After Previous', 'Motor and encoder installation', 0.25, 'Total Hours', 1.0, 'Hours/Piece', 0, 'Hours/Piece'),
  -- Joint 1 Assembly
  ('robotics_oem_parts_v1', 'op_joint_1', 'mm_joint1', 'proc_assembly', 'wc_assembly', 1, 'After Previous', 'Joint assembly', 0.25, 'Total Hours', 0.75, 'Hours/Piece', 0, 'Hours/Piece'),
  ('robotics_oem_parts_v1', 'op_joint_2', 'mm_joint1', 'proc_testing', 'wc_test', 2, 'After Previous', 'Joint testing', 0.1, 'Total Hours', 0.25, 'Hours/Piece', 0, 'Hours/Piece'),

  -- CNC Aerospace: Aluminum Bracket (flat BOM with CNC operations)
  ('cnc_aerospace_parts_v1', 'op_brk_1', 'mm_bracket', 'proc_programming', 'wc_cnc_mill', 1, 'After Previous', 'CAM programming', 0.5, 'Total Hours', 0, 'Hours/Piece', 0, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_brk_2', 'mm_bracket', 'proc_op1', 'wc_cnc_mill', 2, 'After Previous', 'Rough machining', 0.25, 'Total Hours', 0.15, 'Hours/Piece', 0.15, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_brk_3', 'mm_bracket', 'proc_op2', 'wc_cnc_mill', 3, 'After Previous', 'Finish machining', 0.1, 'Total Hours', 0.1, 'Hours/Piece', 0.1, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_brk_4', 'mm_bracket', 'proc_deburr', 'wc_deburr', 4, 'After Previous', 'Deburr and clean', 0, 'Total Hours', 0.1, 'Hours/Piece', 0, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_brk_5', 'mm_bracket', 'proc_inspect', 'wc_inspect', 5, 'After Previous', 'CMM inspection', 0.1, 'Total Hours', 0.15, 'Hours/Piece', 0, 'Hours/Piece'),
  -- Titanium Housing
  ('cnc_aerospace_parts_v1', 'op_hsg_1', 'mm_housing', 'proc_programming', 'wc_cnc_mill', 1, 'After Previous', 'CAM programming', 1.0, 'Total Hours', 0, 'Hours/Piece', 0, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_hsg_2', 'mm_housing', 'proc_op1', 'wc_cnc_mill', 2, 'After Previous', 'Rough machining', 0.5, 'Total Hours', 0.35, 'Hours/Piece', 0.35, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_hsg_3', 'mm_housing', 'proc_op2', 'wc_cnc_mill', 3, 'After Previous', 'Finish machining', 0.25, 'Total Hours', 0.25, 'Hours/Piece', 0.25, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_hsg_4', 'mm_housing', 'proc_deburr', 'wc_deburr', 4, 'After Previous', 'Deburr and clean', 0, 'Total Hours', 0.2, 'Hours/Piece', 0, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_hsg_5', 'mm_housing', 'proc_inspect', 'wc_inspect', 5, 'After Previous', 'Full CMM inspection', 0.15, 'Total Hours', 0.3, 'Hours/Piece', 0, 'Hours/Piece'),
  -- Shaft Assembly
  ('cnc_aerospace_parts_v1', 'op_sft_1', 'mm_shaft', 'proc_programming', 'wc_cnc_lathe', 1, 'After Previous', 'CAM programming', 0.5, 'Total Hours', 0, 'Hours/Piece', 0, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_sft_2', 'mm_shaft', 'proc_op1', 'wc_cnc_lathe', 2, 'After Previous', 'Rough turning', 0.2, 'Total Hours', 0.12, 'Hours/Piece', 0.12, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_sft_3', 'mm_shaft', 'proc_op2', 'wc_cnc_lathe', 3, 'After Previous', 'Finish turning', 0.1, 'Total Hours', 0.08, 'Hours/Piece', 0.08, 'Hours/Piece'),
  ('cnc_aerospace_parts_v1', 'op_sft_4', 'mm_shaft', 'proc_inspect', 'wc_inspect', 4, 'After Previous', 'Dimensional inspection', 0.05, 'Total Hours', 0.1, 'Hours/Piece', 0, 'Hours/Piece'),

  -- Metal Fabrication: Standard Widget
  ('metal_fabrication_parts_v1', 'op_w1_1', 'mm_widget1', 'proc_cutting', 'wc_cutting', 1, 'After Previous', 'Cut base and top', 0.1, 'Total Hours', 0.08, 'Hours/Piece', 0.08, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'op_w1_2', 'mm_widget1', 'proc_forming', 'wc_press', 2, 'After Previous', 'Form base', 0.15, 'Total Hours', 0.1, 'Hours/Piece', 0.1, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'op_w1_3', 'mm_widget1', 'proc_welding', 'wc_welding', 3, 'After Previous', 'Weld assembly', 0.1, 'Total Hours', 0.15, 'Hours/Piece', 0, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'op_w1_4', 'mm_widget1', 'proc_finishing', 'wc_finish', 4, 'After Previous', 'Finish and paint', 0.05, 'Total Hours', 0.12, 'Hours/Piece', 0, 'Hours/Piece'),
  -- Premium Widget
  ('metal_fabrication_parts_v1', 'op_w2_1', 'mm_widget2', 'proc_cutting', 'wc_cutting', 1, 'After Previous', 'Precision cutting', 0.15, 'Total Hours', 0.1, 'Hours/Piece', 0.1, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'op_w2_2', 'mm_widget2', 'proc_forming', 'wc_press', 2, 'After Previous', 'Precision forming', 0.2, 'Total Hours', 0.15, 'Hours/Piece', 0.15, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'op_w2_3', 'mm_widget2', 'proc_welding', 'wc_welding', 3, 'After Previous', 'Precision welding', 0.15, 'Total Hours', 0.2, 'Hours/Piece', 0, 'Hours/Piece'),
  ('metal_fabrication_parts_v1', 'op_w2_4', 'mm_widget2', 'proc_finishing', 'wc_finish', 4, 'After Previous', 'Premium finish', 0.1, 'Total Hours', 0.2, 'Hours/Piece', 0, 'Hours/Piece'),
  -- Widget Assembly
  ('metal_fabrication_parts_v1', 'op_assy_1', 'mm_assy', 'proc_assembly', 'wc_finish', 1, 'After Previous', 'Final assembly', 0.1, 'Total Hours', 0.25, 'Hours/Piece', 0, 'Hours/Piece'),

  -- Automotive Precision: Piston Assembly
  ('automotive_precision_parts_v1', 'op_pis_1', 'mm_piston', 'proc_machining', 'wc_cnc', 1, 'After Previous', 'CNC machining piston', 0.5, 'Total Hours', 0.35, 'Hours/Piece', 0.35, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'op_pis_2', 'mm_piston', 'proc_assembly', 'wc_assembly', 2, 'After Previous', 'Ring installation', 0.1, 'Total Hours', 0.15, 'Hours/Piece', 0, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'op_pis_3', 'mm_piston', 'proc_balancing', 'wc_balance', 3, 'After Previous', 'Weight matching', 0.15, 'Total Hours', 0.2, 'Hours/Piece', 0.1, 'Hours/Piece'),
  -- Crankshaft Assembly
  ('automotive_precision_parts_v1', 'op_crk_1', 'mm_crank', 'proc_machining', 'wc_cnc', 1, 'After Previous', 'CNC machining crankshaft', 1.0, 'Total Hours', 1.5, 'Hours/Piece', 1.5, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'op_crk_2', 'mm_crank', 'proc_balancing', 'wc_balance', 2, 'After Previous', 'Dynamic balancing', 0.25, 'Total Hours', 0.5, 'Hours/Piece', 0.5, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'op_crk_3', 'mm_crank', 'proc_testing', 'wc_dyno', 3, 'After Previous', 'Dyno testing', 0.5, 'Total Hours', 1.0, 'Hours/Piece', 0, 'Hours/Piece'),
  -- Valve Train Assembly
  ('automotive_precision_parts_v1', 'op_vlv_1', 'mm_valve', 'proc_machining', 'wc_cnc', 1, 'After Previous', 'Valve machining', 0.25, 'Total Hours', 0.2, 'Hours/Piece', 0.2, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'op_vlv_2', 'mm_valve', 'proc_assembly', 'wc_assembly', 2, 'After Previous', 'Spring assembly', 0.1, 'Total Hours', 0.15, 'Hours/Piece', 0, 'Hours/Piece'),
  ('automotive_precision_parts_v1', 'op_vlv_3', 'mm_valve', 'proc_testing', 'wc_dyno', 3, 'After Previous', 'Flow testing', 0.15, 'Total Hours', 0.25, 'Hours/Piece', 0, 'Hours/Piece')
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;
