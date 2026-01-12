import {
  AuthProvider,
  BaseProvider,
  createOAuthClient,
  HTTPClient,
  ProviderConfig,
  ProviderCredentials,
  ProviderID
} from "../../core";
import { Accounting, Xero } from "../../entities";
import { transformXeroContact } from "./transform";

interface PaginationParams {
  page: number; // 1-indexed
  pageSize: number; // Items per page
}

export interface IXeroProvider extends BaseProvider {
  contacts: {
    list: (options: PaginationParams) => Promise<Accounting.Contact[]>;
    get: (id: string) => Promise<Accounting.Contact>;
  };
}

type XeroProviderConfig = ProviderConfig<{
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  tenantId?: string;
}> & {
  id: ProviderID.XERO;
  accessToken?: string;
  refreshToken?: string;
};

export class XeroProvider implements IXeroProvider {
  static id = ProviderID.XERO;

  http: HTTPClient;
  auth: AuthProvider;

  constructor(public config: Omit<XeroProviderConfig, "id">) {
    this.http = new HTTPClient("https://api.xero.com/api.xro/2.0");
    this.auth = createOAuthClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      redirectUri: config.redirectUri,
      tokenUrl: "https://identity.xero.com/connect/token",
      onTokenRefresh: config.onTokenRefresh,
      getAuthUrl(scopes: string[], redirectURL: string): string {
        const params = new URLSearchParams({
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectURL,
          scope: scopes.join(" "),
          state: crypto.randomUUID()
        });

        return `https://login.xero.com/identity/connect/authorize?${params.toString()}`;
      }
    });
  }

  get id(): ProviderID.XERO {
    // @ts-expect-error
    return this.constructor.id;
  }

  contacts: IXeroProvider["contacts"] = {
    list: async () => {
      const res = await this.request<{
        Contacts: Xero.Contact[];
      }>("GET", `/Contacts`);

      if (res.error) {
        throw new Error(`Failed to fetch contacts: ${res.message}`);
      }

      const results = res.data?.Contacts || [];

      return results.map((c) => transformXeroContact(c, this.config.companyId));
    },
    get: async (id) => {
      const res = await this.request<{
        Contacts: Xero.Contact[];
      }>("GET", `/Contacts/${id}`);

      if (res.error || !res.data?.Contacts?.length) {
        throw new Error(`Failed to fetch contact ${id}: ${res.message}`);
      }

      const contact = res.data.Contacts[0]!;

      return transformXeroContact(contact, this.config.companyId);
    }
  };

  authenticate(
    code: string,
    redirectUri: string
  ): Promise<ProviderCredentials> {
    return this.auth.exchangeCode(code, redirectUri);
  }

  async request<T>(method: string, url: string, options?: RequestInit) {
    const { accessToken, ...creds } = this.auth.getCredentials();

    const tenantId = creds.tenantId || this.config.tenantId;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...((options?.headers ?? {}) as Record<string, string>)
    };

    if (tenantId) {
      headers["xero-tenant-id"] = tenantId;
    }

    const response = await this.http.request<T>(method, url, {
      ...options,
      headers: headers
    });

    if (response.code === 401) {
      await this.auth.refresh();

      const c = this.auth.getCredentials();

      const retryHeaders: Record<string, string> = {
        ...headers,
        Authorization: `Bearer ${c.accessToken}`
      };

      if (tenantId) {
        retryHeaders["xero-tenant-id"] = tenantId;
      }

      return this.http.request<T>(method, url, {
        ...options,
        headers: retryHeaders
      });
    }

    return response;
  }

  async validate(): Promise<boolean> {
    try {
      const response = await this.request("GET", `/Organisation`);
      return !response.error;
    } catch (error) {
      console.error("Xero validate error:", error);
      return false;
    }
  }
}
