import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.33.1/dist/module/SupabaseClient.d.ts";
import { Transaction } from "https://esm.sh/v135/kysely@0.26.3/dist/cjs/kysely.d.ts";
import { DB } from "../../../lib/database.ts";
import { Database } from "../../../lib/types.ts";

export interface ChatContext {
  db: Transaction<DB>;
  client: SupabaseClient<Database>;
  userId: string;
  companyId: string;
  fullName: string;
  companyName: string;
  baseCurrency: string;
  locale: string;
  currentDateTime: string;
  country?: string;
  city?: string;
  timezone: string;
  chatId: string;
  // Allow additional properties to satisfy Record<string, unknown> constraint
  [key: string]: unknown;
}

export function createChatContext(params: {
  userId: string;
  companyId: string;
  db: Transaction<DB>;
  client: SupabaseClient<Database>;
  fullName: string;
  companyName: string;
  country?: string;
  city?: string;
  chatId: string;
  baseCurrency?: string;
  locale?: string;
  timezone?: string;
  
}) {
  return {
    userId: params.userId,
    companyId: params.companyId,
    db: params.db,
    client: params.client,
    fullName: params.fullName,
    companyName: params.companyName,
    country: params.country,
    city: params.city,
    chatId: params.chatId,
    baseCurrency: params.baseCurrency || "USD",
    locale: params.locale || "en-US",
    currentDateTime: new Date().toISOString(),
    timezone:
      params.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    
  };
}