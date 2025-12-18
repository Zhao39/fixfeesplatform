import { AccountingEntityType, EntityMap } from "../entities";
import { AccountingProvider } from "./models";

export interface AccountingSyncPayload {
  companyId: string;
  provider: AccountingProvider;
  syncType: "webhook" | "scheduled" | "trigger";
  syncDirection: "from-accounting" | "to-accounting" | "bi-directional";
  entities: AccountingEntity[];
  metadata?: {
    tenantId?: string;
    webhookId?: string;
    userId?: string;
    [key: string]: any;
  };
}

export interface AccountingEntity<
  T extends AccountingEntityType = AccountingEntityType
> {
  entityType: T;
  entityId: string;
  operation: "create" | "update" | "delete" | "sync";
  lastSyncedAt?: string;
  data?: Partial<EntityMap[T]>;
}
