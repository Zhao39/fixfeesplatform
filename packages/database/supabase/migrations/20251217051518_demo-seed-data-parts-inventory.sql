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
  ('cnc_parts_v1', 'cnc', 'Parts', 1, 'cnc.parts.v1', 'CNC Parts Demo', 'Demo data for CNC machining parts and BOMs', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Parts (finished goods with BOMs)
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Finished goods
  ('cnc_parts_v1', 'item_fg001', 'FG-BRK-100', 'Aluminum Bracket Assembly', 'Complete bracket assembly with hardware', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),
  ('cnc_parts_v1', 'item_fg002', 'FG-HSG-200', 'Titanium Housing Assembly', 'Complete housing with seals and fasteners', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('cnc_parts_v1', 'item_fg003', 'FG-SFT-300', 'Shaft Assembly', 'Complete shaft assembly with bearings', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),

  -- Sub-assemblies and components
  ('cnc_parts_v1', 'item_sa001', 'SA-BRK-BASE', 'Bracket Base', 'Machined aluminum base component', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),
  ('cnc_parts_v1', 'item_sa002', 'SA-BRK-MOUNT', 'Bracket Mount', 'Machined aluminum mounting component', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),
  ('cnc_parts_v1', 'item_sa003', 'SA-HSG-BODY', 'Housing Body', 'Machined titanium housing body', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),
  ('cnc_parts_v1', 'item_sa004', 'SA-HSG-LID', 'Housing Lid', 'Machined titanium housing lid', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),

  -- Purchased components
  ('cnc_parts_v1', 'item_pc001', 'PC-SCREW-M6', 'M6 Socket Head Screw', 'M6x20mm socket head cap screw', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('cnc_parts_v1', 'item_pc002', 'PC-WASHER-M6', 'M6 Washer', 'M6 flat washer', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('cnc_parts_v1', 'item_pc003', 'PC-SEAL-001', 'O-Ring Seal 50mm', '50mm diameter Viton O-ring', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('cnc_parts_v1', 'item_pc004', 'PC-BEARING-001', 'Ball Bearing 6205', '6205 deep groove ball bearing', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts (these link items to their manufacturing details)
INSERT INTO demo_templates.part ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('cnc_parts_v1', 'item_fg001', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_parts_v1', 'item_fg002', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_parts_v1', 'item_fg003', TRUE, CURRENT_DATE - INTERVAL '30 days', NULL),
  ('cnc_parts_v1', 'item_sa001', TRUE, CURRENT_DATE - INTERVAL '60 days', NULL),
  ('cnc_parts_v1', 'item_sa002', TRUE, CURRENT_DATE - INTERVAL '60 days', NULL),
  ('cnc_parts_v1', 'item_sa003', TRUE, CURRENT_DATE - INTERVAL '60 days', NULL),
  ('cnc_parts_v1', 'item_sa004', TRUE, CURRENT_DATE - INTERVAL '60 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 2) CNC Machining - Inventory Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('cnc_inventory_v1', 'cnc', 'Inventory', 1, 'cnc.inventory.v1', 'CNC Inventory Demo', 'Demo data for CNC machining inventory management', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Inventory (raw materials and consumables)
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Raw materials
  ('cnc_inventory_v1', 'item_rm001', 'RM-AL-6061-1', 'Aluminum 6061 Bar 1" Dia', '1 inch diameter 6061 aluminum bar stock', 'Purchased', 'None', 'Reorder Point', 'FT', TRUE),
  ('cnc_inventory_v1', 'item_rm002', 'RM-AL-6061-2', 'Aluminum 6061 Bar 2" Dia', '2 inch diameter 6061 aluminum bar stock', 'Purchased', 'None', 'Reorder Point', 'FT', TRUE),
  ('cnc_inventory_v1', 'item_rm003', 'RM-AL-6061-PLT', 'Aluminum 6061 Plate 0.5"', '0.5 inch thick 6061 aluminum plate', 'Purchased', 'None', 'Reorder Point', 'SQ FT', TRUE),
  ('cnc_inventory_v1', 'item_rm004', 'RM-TI-GR5-1', 'Titanium Grade 5 Bar 1" Dia', '1 inch diameter Ti-6Al-4V bar stock', 'Purchased', 'Lot Number', 'Reorder Point', 'FT', TRUE),
  ('cnc_inventory_v1', 'item_rm005', 'RM-TI-GR5-PLT', 'Titanium Grade 5 Plate 0.5"', '0.5 inch thick Ti-6Al-4V plate', 'Purchased', 'Lot Number', 'Reorder Point', 'SQ FT', TRUE),
  ('cnc_inventory_v1', 'item_rm006', 'RM-SS-304-1', 'Stainless Steel 304 Bar 1"', '1 inch diameter 304 stainless bar', 'Purchased', 'None', 'Reorder Point', 'FT', TRUE),
  ('cnc_inventory_v1', 'item_rm007', 'RM-SS-304-2', 'Stainless Steel 304 Bar 2"', '2 inch diameter 304 stainless bar', 'Purchased', 'None', 'Reorder Point', 'FT', TRUE),

  -- Tooling and consumables
  ('cnc_inventory_v1', 'item_tl001', 'TL-EM-0250', 'Carbide End Mill 1/4"', '1/4" 4-flute carbide end mill', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('cnc_inventory_v1', 'item_tl002', 'TL-EM-0500', 'Carbide End Mill 1/2"', '1/2" 4-flute carbide end mill', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('cnc_inventory_v1', 'item_tl003', 'TL-EM-0750', 'Carbide End Mill 3/4"', '3/4" 4-flute carbide end mill', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('cnc_inventory_v1', 'item_tl004', 'TL-DR-SET-1', 'Drill Bit Set HSS', 'HSS drill bit set 1/16" to 1/2"', 'Purchased', 'None', 'Reorder Point', 'SET', TRUE),
  ('cnc_inventory_v1', 'item_tl005', 'TL-TAP-M6', 'Tap M6x1.0', 'M6x1.0 spiral point tap', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('cnc_inventory_v1', 'item_tl006', 'TL-TAP-M8', 'Tap M8x1.25', 'M8x1.25 spiral point tap', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),

  -- Consumables
  ('cnc_inventory_v1', 'item_cs001', 'CS-COOLANT-5G', 'Cutting Fluid 5 Gallon', 'Synthetic cutting fluid concentrate', 'Purchased', 'None', 'Reorder Point', 'GAL', TRUE),
  ('cnc_inventory_v1', 'item_cs002', 'CS-WIPES-BOX', 'Shop Wipes Box', 'Industrial cleaning wipes, 200 count', 'Purchased', 'None', 'Reorder Point', 'BOX', TRUE),
  ('cnc_inventory_v1', 'item_cs003', 'CS-GLOVES-L', 'Nitrile Gloves Large', 'Nitrile gloves, large, 100 count', 'Purchased', 'None', 'Reorder Point', 'BOX', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 3) Robotics - Parts Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_parts_v1', 'robotics', 'Parts', 1, 'robotics.parts.v1', 'Robotics Parts Demo', 'Demo data for robotics parts and assemblies', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Robotics Parts
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Robot assemblies
  ('robotics_parts_v1', 'item_r001', 'ROB-ARM-6DOF', '6-Axis Robot Arm', 'Complete 6-axis robotic arm assembly', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('robotics_parts_v1', 'item_r002', 'ROB-BASE-001', 'Robot Base Assembly', 'Robot base with mounting plate', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),
  ('robotics_parts_v1', 'item_r003', 'ROB-JOINT-1', 'Joint 1 Assembly', 'Base rotation joint assembly', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('robotics_parts_v1', 'item_r004', 'ROB-JOINT-2', 'Joint 2 Assembly', 'Shoulder joint assembly', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),
  ('robotics_parts_v1', 'item_r005', 'ROB-JOINT-3', 'Joint 3 Assembly', 'Elbow joint assembly', 'Manufactured', 'Serial Number', 'Make to Order', 'EA', TRUE),

  -- Sub-components
  ('robotics_parts_v1', 'item_r101', 'ROB-MOTOR-1', 'Servo Motor 1kW', '1kW AC servo motor', 'Purchased', 'Serial Number', 'Reorder Point', 'EA', TRUE),
  ('robotics_parts_v1', 'item_r102', 'ROB-MOTOR-2', 'Servo Motor 2kW', '2kW AC servo motor', 'Purchased', 'Serial Number', 'Reorder Point', 'EA', TRUE),
  ('robotics_parts_v1', 'item_r103', 'ROB-ENCODER-001', 'Absolute Encoder', 'High-resolution absolute encoder', 'Purchased', 'Serial Number', 'Reorder Point', 'EA', TRUE),
  ('robotics_parts_v1', 'item_r104', 'ROB-GEARBOX-001', 'Harmonic Gearbox 100:1', '100:1 ratio harmonic drive gearbox', 'Purchased', 'Serial Number', 'Reorder Point', 'EA', TRUE),
  ('robotics_parts_v1', 'item_r105', 'ROB-CABLE-001', 'Robot Cable Harness', 'Multi-conductor cable harness', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts for Robotics
INSERT INTO demo_templates.part ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('robotics_parts_v1', 'item_r001', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_parts_v1', 'item_r002', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_parts_v1', 'item_r003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_parts_v1', 'item_r004', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('robotics_parts_v1', 'item_r005', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 4) Robotics - Inventory Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('robotics_inventory_v1', 'robotics', 'Inventory', 1, 'robotics.inventory.v1', 'Robotics Inventory Demo', 'Demo data for robotics inventory management', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for Robotics Inventory
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Electronic components
  ('robotics_inventory_v1', 'item_e001', 'EL-PLC-001', 'PLC Controller', 'Industrial PLC with I/O modules', 'Purchased', 'Serial Number', 'Reorder Point', 'EA', TRUE),
  ('robotics_inventory_v1', 'item_e002', 'EL-DRIVE-001', 'Servo Drive 3kW', '3kW servo motor drive', 'Purchased', 'Serial Number', 'Reorder Point', 'EA', TRUE),
  ('robotics_inventory_v1', 'item_e003', 'EL-SENSOR-PROX', 'Proximity Sensor', 'Inductive proximity sensor M18', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('robotics_inventory_v1', 'item_e004', 'EL-SENSOR-VIS', 'Vision Sensor', '2D vision sensor with LED illumination', 'Purchased', 'Serial Number', 'Reorder Point', 'EA', TRUE),
  ('robotics_inventory_v1', 'item_e005', 'EL-RELAY-001', 'Safety Relay Module', 'Dual-channel safety relay', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),

  -- Pneumatic components
  ('robotics_inventory_v1', 'item_p001', 'PN-VALVE-SOL', 'Solenoid Valve 5/2', '5/2 way solenoid valve', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('robotics_inventory_v1', 'item_p002', 'PN-CYL-50', 'Pneumatic Cylinder 50mm', '50mm bore pneumatic cylinder', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('robotics_inventory_v1', 'item_p003', 'PN-GRIP-001', 'Pneumatic Gripper', 'Parallel pneumatic gripper', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('robotics_inventory_v1', 'item_p004', 'PN-FITTING-1/4', 'Push-to-Connect 1/4"', 'Push-to-connect fitting 1/4"', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('robotics_inventory_v1', 'item_p005', 'PN-TUBE-1/4', 'Pneumatic Tubing 1/4"', 'Polyurethane tubing 1/4" OD', 'Purchased', 'None', 'Reorder Point', 'FT', TRUE),

  -- Mechanical components
  ('robotics_inventory_v1', 'item_m001', 'MC-BEARING-6205', 'Ball Bearing 6205', '6205 deep groove ball bearing', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('robotics_inventory_v1', 'item_m002', 'MC-BEARING-6305', 'Ball Bearing 6305', '6305 deep groove ball bearing', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('robotics_inventory_v1', 'item_m003', 'MC-BELT-GT2', 'Timing Belt GT2', 'GT2 timing belt 6mm width', 'Purchased', 'None', 'Reorder Point', 'FT', TRUE),
  ('robotics_inventory_v1', 'item_m004', 'MC-PULLEY-GT2', 'Timing Pulley GT2 20T', 'GT2 timing pulley 20 teeth', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 5) General Manufacturing - Parts Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('general_parts_v1', 'general', 'Parts', 1, 'general.parts.v1', 'General Parts Demo', 'Demo data for general manufacturing parts', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for General Parts
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Finished products
  ('general_parts_v1', 'item_g001', 'PROD-001', 'Standard Widget', 'Standard production widget', 'Manufactured', 'None', 'Make to Stock', 'EA', TRUE),
  ('general_parts_v1', 'item_g002', 'PROD-002', 'Premium Widget', 'Premium quality widget', 'Manufactured', 'None', 'Make to Stock', 'EA', TRUE),
  ('general_parts_v1', 'item_g003', 'ASSY-001', 'Widget Assembly', 'Complete widget assembly', 'Manufactured', 'None', 'Make to Order', 'EA', TRUE),

  -- Components
  ('general_parts_v1', 'item_g101', 'COMP-BASE', 'Widget Base', 'Base component for widget', 'Manufactured', 'None', 'Make to Stock', 'EA', TRUE),
  ('general_parts_v1', 'item_g102', 'COMP-TOP', 'Widget Top', 'Top component for widget', 'Manufactured', 'None', 'Make to Stock', 'EA', TRUE),
  ('general_parts_v1', 'item_g103', 'COMP-SPRING', 'Spring Component', 'Spring for widget assembly', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('general_parts_v1', 'item_g104', 'COMP-SCREW', 'Assembly Screw', 'M4x12mm screw for assembly', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- Template Parts for General Manufacturing
INSERT INTO demo_templates.part ("templateSetId", "templateRowId", "approved", "fromDate", "toDate")
VALUES
  ('general_parts_v1', 'item_g001', TRUE, CURRENT_DATE - INTERVAL '180 days', NULL),
  ('general_parts_v1', 'item_g002', TRUE, CURRENT_DATE - INTERVAL '180 days', NULL),
  ('general_parts_v1', 'item_g003', TRUE, CURRENT_DATE - INTERVAL '90 days', NULL),
  ('general_parts_v1', 'item_g101', TRUE, CURRENT_DATE - INTERVAL '180 days', NULL),
  ('general_parts_v1', 'item_g102', TRUE, CURRENT_DATE - INTERVAL '180 days', NULL)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- 6) General Manufacturing - Inventory Module Templates
-- =========================================

INSERT INTO "templateSet" ("id", "industryId", "moduleId", "version", "key", "name", "description", "isSystem")
VALUES
  ('general_inventory_v1', 'general', 'Inventory', 1, 'general.inventory.v1', 'General Inventory Demo', 'Demo data for general manufacturing inventory', TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Template Items for General Inventory
INSERT INTO demo_templates.item ("templateSetId", "templateRowId", "readableId", "name", "description", "type", "itemTrackingType", "replenishmentSystem", "unitOfMeasureCode", "active")
VALUES
  -- Raw materials
  ('general_inventory_v1', 'item_rm001', 'RM-STEEL-SHEET', 'Steel Sheet 16GA', '16 gauge cold rolled steel sheet', 'Purchased', 'None', 'Reorder Point', 'SQ FT', TRUE),
  ('general_inventory_v1', 'item_rm002', 'RM-PLASTIC-ABS', 'ABS Plastic Sheet', '1/8" ABS plastic sheet', 'Purchased', 'None', 'Reorder Point', 'SQ FT', TRUE),
  ('general_inventory_v1', 'item_rm003', 'RM-WOOD-PLY', 'Plywood 3/4"', '3/4" birch plywood', 'Purchased', 'None', 'Reorder Point', 'SQ FT', TRUE),

  -- Hardware
  ('general_inventory_v1', 'item_hw001', 'HW-SCREW-M4', 'M4x12mm Screw', 'M4x12mm pan head screw', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('general_inventory_v1', 'item_hw002', 'HW-SCREW-M6', 'M6x20mm Screw', 'M6x20mm socket head screw', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('general_inventory_v1', 'item_hw003', 'HW-NUT-M4', 'M4 Hex Nut', 'M4 hex nut', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('general_inventory_v1', 'item_hw004', 'HW-NUT-M6', 'M6 Hex Nut', 'M6 hex nut', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('general_inventory_v1', 'item_hw005', 'HW-WASHER-M6', 'M6 Flat Washer', 'M6 flat washer', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),

  -- Packaging
  ('general_inventory_v1', 'item_pk001', 'PK-BOX-SM', 'Small Shipping Box', 'Small corrugated shipping box', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('general_inventory_v1', 'item_pk002', 'PK-BOX-MD', 'Medium Shipping Box', 'Medium corrugated shipping box', 'Purchased', 'None', 'Reorder Point', 'EA', TRUE),
  ('general_inventory_v1', 'item_pk003', 'PK-TAPE', 'Packing Tape', '2" packing tape roll', 'Purchased', 'None', 'Reorder Point', 'ROLL', TRUE),
  ('general_inventory_v1', 'item_pk004', 'PK-BUBBLE', 'Bubble Wrap', 'Bubble wrap roll 12" wide', 'Purchased', 'None', 'Reorder Point', 'FT', TRUE)
ON CONFLICT ("templateSetId", "templateRowId") DO NOTHING;

-- =========================================
-- Summary of Template Sets Created
-- =========================================
-- CNC Machining:
--   - cnc.parts.v1: 11 items (finished goods, sub-assemblies, purchased), 7 parts
--   - cnc.inventory.v1: 16 items (raw materials, tooling, consumables)
-- Robotics:
--   - robotics.parts.v1: 10 items (robot assemblies and components), 5 parts
--   - robotics.inventory.v1: 14 items (electronic, pneumatic, mechanical components)
-- General:
--   - general.parts.v1: 7 items (products and components), 5 parts
--   - general.inventory.v1: 13 items (raw materials, hardware, packaging)
