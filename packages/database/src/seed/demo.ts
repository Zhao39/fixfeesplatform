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

export const demoModules = [
  "Sales",
  "Purchasing",
  "Parts",
  "Inventory"
] as const;

export type DemoModule = (typeof demoModules)[number];

export type DemoSeedStatus = "pending" | "running" | "done" | "failed";
export type DemoSeedRunStatus = "queued" | "running" | "done" | "failed";

export interface IndustryRecord {
  id: Industry;
  name: string;
  description?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleRecord {
  id: DemoModule;
  name: string;
  description?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSet {
  id: string;
  industryId: Industry;
  moduleId: DemoModule;
  version: number;
  key: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdBy?: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemoSeedState {
  companyId: string;
  moduleId: DemoModule;
  templateSetId: string;
  status: DemoSeedStatus;
  seededBy?: string;
  seededAt?: string;
  lastError?: string;
  createdAt: string;
}

export interface DemoSeedRun {
  id: string;
  companyId: string;
  requestedBy?: string;
  industryId: Industry;
  requestedModules: DemoModule[];
  status: DemoSeedRunStatus;
  startedAt?: string;
  finishedAt?: string;
  error?: {
    message: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DemoStatistics {
  entity: string;
  totalCount: number;
  demoCount: number;
}

export interface DemoStatusResult {
  moduleId: DemoModule;
  status: DemoSeedStatus;
  seededAt?: string;
  templateKey: string;
}

/**
 * Demo template row tracking interface
 * Add these fields to any entity that supports demo data
 */
export interface DemoTrackingFields {
  isDemo: boolean;
}

/**
 * Template set key builder
 */
export function buildTemplateSetKey(
  industryId: Industry,
  moduleId: DemoModule,
  version: number = 1
): string {
  return `${industryId}.${moduleId.toLowerCase()}.v${version}`;
}

/**
 * Parse template set key
 */
export function parseTemplateSetKey(key: string): {
  industryId: Industry;
  moduleId: string;
  version: number;
} | null {
  const match = key.match(/^([^.]+)\.([^.]+)\.v(\d+)$/);
  if (!match) return null;

  return {
    industryId: match[1] as Industry,
    moduleId: match[2],
    version: parseInt(match[3], 10)
  };
}

/**
 * Check if an entity is demo data
 */
export function isDemoData(entity: Partial<DemoTrackingFields>): boolean {
  return entity.isDemo === true;
}

/**
 * Get recommended modules for an industry
 */
export function getRecommendedModules(industryId: Industry): DemoModule[] {
  // All industries get all available modules for now
  return ["Sales", "Purchasing", "Parts", "Inventory"];
}

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

/**
 * Module display information
 */
export const moduleInfo: Record<
  DemoModule,
  { name: string; description: string }
> = {
  Sales: {
    name: "Sales",
    description: "Quotes, orders, and customer management"
  },
  Purchasing: {
    name: "Purchasing",
    description: "Purchase orders and supplier management"
  },
  Parts: {
    name: "Parts",
    description: "Parts and bill of materials"
  },
  Inventory: {
    name: "Inventory",
    description: "Inventory tracking and management"
  }
};

// Re-export Kysely-based seeding utilities
export {
  cleanupDemoData,
  createDemoSeeder,
  DemoSeeder,
  generateDemoId,
  seedDemoData
} from "./seed-demo-data";
