import {
  QUICKBOOKS_CLIENT_ID,
  QUICKBOOKS_CLIENT_SECRET,
  VERCEL_URL,
} from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { QuickBooks } from "@carbon/ee";
import { json, redirect, type LoaderFunctionArgs } from "@vercel/remix";
import z from "zod";
import { upsertCompanyIntegration } from "~/modules/settings/settings.server";
import { oAuthCallbackSchema } from "~/modules/shared";
import { path } from "~/utils/path";

export const config = {
  runtime: "nodejs",
};

const quickbooksOAuthTokenResponseSchema = z.object({
  token_type: z.literal("bearer"),
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  x_refresh_token_expires_in: z.number(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, userId, companyId } = await requirePermissions(request, {
    update: "settings",
  });

  const url = new URL(request.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const quickbooksAuthResponse = oAuthCallbackSchema
    .extend({
      realmId: z.string(),
    })
    .safeParse(searchParams);

  if (!quickbooksAuthResponse.success) {
    return json({ error: "Invalid QuickBooks auth response" }, { status: 400 });
  }

  const { data } = quickbooksAuthResponse;

  // TODO: Verify state parameter
  if (!data.state) {
    return json({ error: "Invalid state parameter" }, { status: 400 });
  }

  if (
    !QUICKBOOKS_CLIENT_ID ||
    !QUICKBOOKS_CLIENT_SECRET ||
    !QuickBooks.oauth?.tokenUrl
  ) {
    return json({ error: "QuickBooks OAuth not configured" }, { status: 500 });
  }

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: data.code,
      redirect_uri: `${url.origin}/api/integrations/quickbooks/oauth`,
    });

    const credentials = Buffer.from(
      `${QUICKBOOKS_CLIENT_ID}:${QUICKBOOKS_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(QuickBooks.oauth?.tokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: body.toString(),
    });

    if (!response.ok) {
      return json(
        { error: "Failed to exchange code for token - HTTP error" },
        { status: 500 }
      );
    }

    const responseText = await response.text();

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      return json(
        { error: "Invalid JSON response from QuickBooks" },
        { status: 500 }
      );
    }

    // Check if QuickBooks returned an error
    if (responseData.error) {
      return json(
        { error: `QuickBooks OAuth error: ${responseData.error}` },
        { status: 400 }
      );
    }

    const parsedJson =
      quickbooksOAuthTokenResponseSchema.safeParse(responseData);

    if (!parsedJson.success) {
      return json(
        { error: "Failed to parse QuickBooks OAuth response" },
        { status: 500 }
      );
    }

    const { data: tokenData } = parsedJson;

    const createdQuickBooksIntegration = await upsertCompanyIntegration(
      client,
      {
        id: QuickBooks.id,
        active: true,
        metadata: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          realm_id: data.realmId,
          expires_in: tokenData.expires_in,
          x_refresh_token_expires_in: tokenData.x_refresh_token_expires_in,
          token_expires_at: new Date(
            Date.now() + tokenData.expires_in * 1000
          ).toISOString(),
          refresh_token_expires_at: new Date(
            Date.now() + tokenData.x_refresh_token_expires_in * 1000
          ).toISOString(),
        },
        updatedBy: userId,
        companyId: companyId,
      }
    );

    if (createdQuickBooksIntegration?.data?.metadata) {
      const requestUrl = new URL(request.url);

      if (!VERCEL_URL || VERCEL_URL.includes("localhost")) {
        requestUrl.protocol = "http";
      }

      const redirectUrl = `${requestUrl.origin}${path.to.integrations}`;

      return redirect(redirectUrl);
    } else {
      return json(
        { error: "Failed to save QuickBooks integration" },
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
