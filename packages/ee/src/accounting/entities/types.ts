import z from "zod";
import { AccountingProvider } from "../core";
import { CustomerSchema } from "./schema";

type AccountingEntityType = "customer";
// Uncomment and expand as needed
// | "bill" // Purchase Invoice
// | "employee"
// | "invoice"
// | "item"
// | "purchase_order"
// | "sales_order"
// | "inventory_adjustment";

interface EntityMap {
  customer: Accounting.Customer;
}

export interface AccountingEntity<
  T extends AccountingEntityType = AccountingEntityType
> {
  provider: AccountingProvider;
  entityType: T;
  entityId: string;
  operation: "create" | "update" | "delete" | "sync";
  lastSyncedAt?: string;
  data?: EntityMap[T];
}

export namespace Accounting {
  export type Customer = z.infer<typeof CustomerSchema>;
}
