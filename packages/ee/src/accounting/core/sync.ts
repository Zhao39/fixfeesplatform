import { AccountingEntity } from "../entities";
import { AccountingProvider } from "./models";

export interface AccountingSyncPayload {
  companyId: string;
  provider: AccountingProvider;
  syncType: "webhook" | "scheduled" | "trigger";
  syncDirection: "fromAccounting" | "toAccounting" | "bidirectional";
  entities: AccountingEntity[];
  metadata?: {
    tenantId?: string;
    webhookId?: string;
    userId?: string;
    [key: string]: any;
  };
}
