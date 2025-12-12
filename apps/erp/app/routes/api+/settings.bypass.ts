import { STRIPE_BYPASS_COMPANY_IDS } from "@carbon/auth";

export async function loader() {
  if (STRIPE_BYPASS_COMPANY_IDS) {
    const bypassList = STRIPE_BYPASS_COMPANY_IDS.split(",").map((id: string) =>
      id.trim()
    );
    return { bypassList };
  }
  return { bypassList: [] };
}
