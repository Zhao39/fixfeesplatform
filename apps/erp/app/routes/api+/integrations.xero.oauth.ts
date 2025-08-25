import { VERCEL_URL, XERO_CLIENT_ID, XERO_CLIENT_SECRET } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { Xero } from "@carbon/ee";
import { XeroProvider } from "@carbon/ee/xero";
import { json, redirect, type LoaderFunctionArgs } from "@vercel/remix";
import { upsertCompanyIntegration } from "~/modules/settings/settings.server";
import { oAuthCallbackSchema } from "~/modules/shared";
import { path } from "~/utils/path";

export const config = {
  runtime: "nodejs",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, userId, companyId } = await requirePermissions(request, {
    update: "settings",
  });

  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const xeroAuthResponse = oAuthCallbackSchema.safeParse(searchParams);

  if (!xeroAuthResponse.success) {
    return json({ error: "Invalid Xero auth response" }, { status: 400 });
  }

  const { data } = xeroAuthResponse;

  // TODO: Verify state parameter
  if (!data.state) {
    return json({ error: "Invalid state parameter" }, { status: 400 });
  }

  if (!XERO_CLIENT_ID || !XERO_CLIENT_SECRET) {
    return json({ error: "Xero OAuth not configured" }, { status: 500 });
  }

  try {
    // Use the XeroProvider to handle the OAuth flow
    const provider = new XeroProvider({
      clientId: XERO_CLIENT_ID,
      clientSecret: XERO_CLIENT_SECRET,
      redirectUri: `${url.origin}/api/integrations/xero/oauth`,
    });

    // Exchange the authorization code for tokens
    const auth = await provider.exchangeCodeForToken(data.code);
    if (!auth) {
      return json(
        { error: "Failed to exchange code for token" },
        { status: 500 }
      );
    }

    const createdXeroIntegration = await upsertCompanyIntegration(client, {
      id: Xero.id,
      active: true,
      // @ts-ignore
      metadata: {
        ...auth,
      },
      updatedBy: userId,
      companyId: companyId,
    });

    if (createdXeroIntegration?.data?.metadata) {
      const requestUrl = new URL(request.url);

      if (!VERCEL_URL || VERCEL_URL.includes("localhost")) {
        requestUrl.protocol = "http";
      }

      const redirectUrl = `${requestUrl.origin}${path.to.integrations}`;

      return redirect(redirectUrl);
    } else {
      return json(
        { error: "Failed to save Xero integration" },
        { status: 500 }
      );
    }
  } catch (err) {
    return json(
      { error: "Failed to exchange code for token" },
      { status: 500 }
    );
  }
}
