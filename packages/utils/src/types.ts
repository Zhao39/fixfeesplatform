import type { FileObject } from "@supabase/storage-js";
import type { ReactElement } from "react";
import type { IconType } from "react-icons";
import { z } from "zod";

export enum Edition {
  Cloud = "cloud",
  Enterprise = "enterprise",
  Community = "community",
}

export type Mode = "light" | "dark";

export const modeValidator = z.object({
  mode: z.enum(["light", "dark", "system"]),
});

export enum Plan {
  Starter = "STARTER",
  Business = "BUSINESS",
  Partner = "PARTNER",
  Unknown = "UNKNOWN",
}

export type PickPartial<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export interface TrackedEntityAttributes {
  "Batch Number"?: string;
  Customer?: string;
  Job?: string;
  "Job Make Method"?: string;
  "Purchase Order"?: string;
  "Purchase Order Line"?: string;
  "Receipt Line Index"?: number;
  "Receipt Line"?: string;
  Receipt?: string;
  "Sales Order"?: string;
  "Sales Order Line"?: string;
  Supplier?: string;
  "Serial Number"?: string;
  "Shipment Line Index"?: number;
  "Shipment Line"?: string;
  Shipment?: string;
  "Split Entity ID"?: string;
}

export interface TrackedActivityAttributes {
  "Consumed Quantity"?: number;
  "Job Make Method"?: string;
  "Job Material"?: string;
  "Job Operation"?: string;
  "Original Quantity"?: number;
  "Production Event"?: string;
  "Receipt Line"?: string;
  "Remaining Quantity"?: number;
  Employee?: string;
  Job?: string;
  Receipt?: string;
  "Work Center"?: string;
}

export type Action = {
  label: string;
  icon: ReactElement;
  onClick: () => void;
};

export type Authenticated<T = {}> = T & {
  role?: "employee" | "customer" | "supplier";
  permission?: string;
  internal?: boolean;
};

export type AuthenticatedRouteGroup<T = {}> = T & {
  name: string;
  icon?: any;
  routes: Authenticated<Route & T>[];
};

export type ListItem = {
  id: string;
  name: string;
};

export type ModelUpload = {
  modelId: string | null;
  modelName: string | null;
  modelPath: string | null;
  modelSize: number | null;
  thumbnailPath: string | null;
};

export type NavItem = Omit<Route, "icon"> & {
  icon: IconType;
  backgroundColor?: string;
  foregroundColor?: string;
};

export type Result = {
  success: boolean;
  message?: string;
};

export type Route = {
  name: string;
  to: string;
  icon?: any;
  views?: {
    id: string;
    name: string;
    to: string;
    sortOrder: number;
  }[];
  q?: string; // TODO: this is dumb
  table?: string;
};

export type RouteGroup = {
  name: string;
  icon?: any;
  routes: Route[];
};

export interface SelectOption {
  label: string;
  value: string;
  helper?: string;
}

export type StorageItem = FileObject & {
  bucket: string;
};
