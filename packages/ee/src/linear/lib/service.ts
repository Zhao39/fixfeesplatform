import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getLinearIntegration(
  client: SupabaseClient<Database>,
  companyId: string
) {
  return await client
    .from("companyIntegration")
    .select("*")
    .eq("companyId", companyId)
    .eq("id", "slack")
    .limit(1);
}
