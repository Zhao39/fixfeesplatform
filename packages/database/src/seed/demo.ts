/**
 * Demo Template System Types and Utilities
 *
 * This module provides TypeScript types and utilities for working with
 * the demo template system in Carbon.
 */

export const industries = [
  "robotics_oem",
  "cnc_aerospace",
  "metal_fabrication",
  "automotive_precision"
] as const;

export type Industry = (typeof industries)[number];

const demoModules = ["Sales", "Purchasing", "Parts", "Inventory"] as const;

export type DemoModule = (typeof demoModules)[number];

/**
 * Industry display information
 */
export const industryInfo: Record<
  Industry,
  { name: string; description: string }
> = {
  robotics_oem: {
    name: "HumanoTech Robotics",
    description: "Original Equipment Manufacturer building humanoid robots"
  },
  cnc_aerospace: {
    name: "SkyLine Precision Parts",
    description:
      "CNC machine shop fabricating metal and composite parts for aerospace"
  },
  metal_fabrication: {
    name: "TitanFab Industries",
    description:
      "Fabrication shop crafting structural metal components and assemblies"
  },
  automotive_precision: {
    name: "Apex Motors Engineering",
    description:
      "Manufacturer producing precision parts and assemblies for high-performance vehicles"
  }
};

// Re-export Kysely-based seeding utilities
export { createDemoSeeder } from "./seed-demo-data";
