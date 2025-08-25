import { VERCEL_URL, XERO_CLIENT_ID, XERO_CLIENT_SECRET } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { Xero } from "@carbon/ee";
import { json, redirect, type LoaderFunctionArgs } from "@vercel/remix";
import z from "zod";
import { upsertCompanyIntegration } from "~/modules/settings/settings.server";
import { oAuthCallbackSchema } from "~/modules/shared";
import { path } from "~/utils/path";

export const config = {
  runtime: "nodejs",
};

const xeroOAuthTokenResponseSchema = z.object({
  token_type: z.literal("Bearer"),
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
});

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

  if (!XERO_CLIENT_ID || !XERO_CLIENT_SECRET || !Xero.oauth?.tokenUrl) {
    return json({ error: "Xero OAuth not configured" }, { status: 500 });
  }

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: data.code,
      redirect_uri: `${url.origin}/api/integrations/xero/oauth`,
    });

    const credentials = Buffer.from(
      `${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(Xero.oauth?.tokenUrl, {
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
        { error: "Invalid JSON response from Xero" },
        { status: 500 }
      );
    }

    // Check if Xero returned an error
    if (responseData.error) {
      return json(
        { error: `Xero OAuth error: ${responseData.error}` },
        { status: 400 }
      );
    }

    const parsedJson = xeroOAuthTokenResponseSchema.safeParse(responseData);

    if (!parsedJson.success) {
      return json(
        { error: "Failed to parse Xero OAuth response" },
        { status: 500 }
      );
    }

    const { data: tokenData } = parsedJson;

    const createdXeroIntegration = await upsertCompanyIntegration(client, {
      id: Xero.id,
      active: true,
      metadata: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_expires_at: new Date(
          Date.now() + tokenData.expires_in * 1000
        ).toISOString(),
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
