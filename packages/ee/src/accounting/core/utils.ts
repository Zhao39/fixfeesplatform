import type { Kysely, KyselyDatabase, KyselyTx } from "@carbon/database/client";
import { sql } from "kysely";
import type {
  AuthProvider,
  OAuthClientOptions,
  ProviderCredentials
} from "./types";

/**
 * Execute a database operation with sync triggers disabled.
 * This prevents circular trigger loops when syncing from external systems.
 *
 * Uses PostgreSQL session variable `app.sync_in_progress` which is checked
 * by the `dispatch_event_batch` trigger function.
 *
 * @param db - The Kysely database instance
 * @param operation - A callback that receives the transaction and performs DB operations
 */
export async function withSyncDisabled<T>(
  db: Kysely<KyselyDatabase>,
  operation: (tx: KyselyTx) => Promise<T>
): Promise<T> {
  return db.transaction().execute(async (tx) => {
    // Set the session variable to disable event triggers for this transaction
    await sql`SET LOCAL "app.sync_in_progress" = 'true'`.execute(tx);
    return await operation(tx);
  });
}

export class HTTPClient {
  constructor(private baseUrl?: string) {}

  async request<T>(method: string, path: string, opts: RequestInit = {}) {
    let response!: Response;

    try {
      response = await this.fetch(method, path, opts);

      if (response.status === 429) {
        throw new RatelimitError("Rate limit exceeded", response);
      }

      return this.parseResponse<T>(response);
    } catch (error) {
      if (error instanceof RatelimitError) {
        throw error;
      }

      return this.parseResponse<T>(response);
    }
  }

  private fetch(
    method: string,
    path: string,
    opts: RequestInit
  ): Promise<Response> {
    const url = this.baseUrl ? `${this.baseUrl}${path}` : path;

    return fetch(url, {
      method,
      ...opts
    });
  }

  private async parseResponse<T>(response: Response) {
    const hasBody =
      response.headers.get("content-length") !== "0" &&
      response.headers.get("content-type")?.includes("application/json");

    if (!response.ok) {
      return {
        error: true,
        message: response.statusText,
        code: response.status,
        data: await response.text()
      } as const;
    }

    if (hasBody) {
      return {
        error: false,
        message: response.statusText,
        code: response.status,
        data: (await response.json()) as T
      } as const;
    }

    return {
      error: false,
      message: response.statusText,
      code: response.status,
      data: null
    } as const;
  }
}

// /********************************************************\
// *                     Custom Errors Start                *
// \********************************************************/
export class NotImplementedError extends Error {
  constructor(name: string) {
    super(`Method ${name} is not implemented.`);
    this.name = "NotImplementedError";
  }
}

export class RatelimitError extends Error {
  constructor(
    message: string,
    public response: Response
  ) {
    super(message);
    this.name = "RatelimitError";
    this.response = response;
  }
}
// /********************************************************\
// *                     Custom Errors End                  *
// \********************************************************/

export function createOAuthClient({
  clientId,
  clientSecret,
  ...options
}: OAuthClientOptions): AuthProvider {
  const basicAuth = btoa(`${clientId}:${clientSecret}`);
  const http = new HTTPClient();

  let creds: ProviderCredentials = {
    type: "oauth2",
    accessToken: options.accessToken!,
    refreshToken: options.refreshToken!
  };

  return {
    getAuthUrl: options.getAuthUrl,
    async exchangeCode(code: string, redirectUri?: string) {
      const response = await http.request<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>("POST", options.tokenUrl, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri ?? options.redirectUri ?? ""
        })
      });

      if (response.error || !response.data) {
        throw new Error(`Auth failed: ${response.data}`);
      }

      const newCreds = {
        type: "oauth2",
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(
          Date.now() + response.data.expires_in * 1000
        ).toISOString()
      } satisfies ProviderCredentials;

      creds = {
        ...creds,
        ...newCreds
      };

      options.onTokenRefresh && (await options.onTokenRefresh(newCreds));

      return newCreds;
    },
    async refresh() {
      console.log("Refreshing OAuth tokens", creds);
      if (!creds?.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await http.request<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>("POST", options.tokenUrl, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: creds.refreshToken
        })
      });

      if (response.error || !response.data) {
        console.log(response.data);
        throw new Error(`Token refresh failed: ${response.error}`);
      }

      const newCreds = {
        type: "oauth2",
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: new Date(
          Date.now() + response.data.expires_in * 1000
        ).toISOString(),
        tenantId: creds?.tenantId
      } satisfies ProviderCredentials;

      creds = {
        ...creds,
        ...newCreds
      };

      options.onTokenRefresh && (await options.onTokenRefresh(newCreds));

      return newCreds;
    },
    getCredentials() {
      if (!creds) {
        throw new Error("No credentials available");
      }

      return creds;
    }
  };
}
