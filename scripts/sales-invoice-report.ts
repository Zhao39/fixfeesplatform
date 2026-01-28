import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const companyId = process.env.COMPANY_ID;
const apiKey = process.env.CARBON_API_KEY;
const publicApiKey = process.env.SUPABASE_ANON_KEY;

if (!companyId || !apiKey || !publicApiKey) {
  throw new Error(
    "Missing required environment variables: COMPANY_ID, CARBON_API_KEY, SUPABASE_ANON_KEY"
  );
}

const carbon = createClient("https://api.carbon.ms", publicApiKey, {
  global: {
    headers: {
      "carbon-key": apiKey,
    },
  },
});

(async () => {
  const { data, error } = await carbon
    .from("salesInvoice")
    .select(
      "*, salesInvoiceLine(*), salesInvoiceShipment(*), customer!salesInvoice_customerId_fkey(name, tags)"
    )
    .eq("companyId", companyId)
    .limit(1000)
    .order("createdAt", { ascending: false });

  if (data) {
    fs.writeFileSync(
      "sales-invoice-report.json",
      JSON.stringify(data, null, 2)
    );
  }

  if (error) {
    console.error(error);
  }
})();
