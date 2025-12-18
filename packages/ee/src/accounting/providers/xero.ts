import {
  AccountingProvider,
  AuthProvider,
  BaseProvider,
  createOAuthClient,
  HTTPClient,
  ProviderConfig,
  ProviderCredentials,
  Resource
} from "../core";
import { Accounting } from "../entities/types";
import { Xero } from "../entities/xero";

export interface IXeroProvider extends BaseProvider {
  contacts: Pick<
    Resource<Accounting.Customer, unknown, unknown>,
    "get" | "list"
  >;
}

type XeroProviderConfig = ProviderConfig<{
  clientId: string;
  clientSecret: string;
  tenantId?: string;
}> & {
  id: AccountingProvider.XERO;
  accessToken?: string;
  refreshToken?: string;
};

const fromDotnetDate = (date: Date | string) => {
  if (typeof date === "string") {
    const value = date.replace(/\/Date\((\d+)([-+]\d+)?\)\//, "$1");
    return new Date(parseInt(value));
  }

  return date;
};

export class XeroProvider implements IXeroProvider {
  http: HTTPClient;
  auth: AuthProvider;

  constructor(public config: Omit<XeroProviderConfig, "id">) {
    this.http = new HTTPClient("https://api.xero.com/api.xro/2.0", 3);
    this.auth = createOAuthClient({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      accessToken: config.accessToken,
      refreshToken: config.refreshToken,
      tokenUrl: "https://identity.xero.com/connect/token",
      getAuthUrl(scopes: string[], redirectURL): string {
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

  contacts: IXeroProvider["contacts"] = {
    list: async () => {
      const res = await this.http.requestWithRetry<{
        Contacts: Xero.Contact[];
      }>("GET", `/Contacts`);

      if (res.error) {
        throw new Error(`Failed to fetch contacts: ${res.message}`);
      }

      return (res.data?.Contacts || []).map((contact) => ({
        name: `${contact.FirstName || ""} ${contact.LastName || ""}`.trim(),
        companyId: this.config.companyId,
        website: contact.Website,
        currencyCode: contact.DefaultCurrency ?? "USD",
        taxId: contact.TaxNumber,
        phone: contact.Phones?.[0]?.PhoneNumber,
        email: contact.EmailAddress?.[0],
        updatedAt: fromDotnetDate(contact.UpdatedDateUTC).toISOString()
      }));
    },
    get: async (id) => {
      const res = await this.http.requestWithRetry<{
        Contacts: Xero.Contact[];
      }>("GET", `/Contacts/${id}`);

      if (res.error || !res.data?.Contacts?.length) {
        throw new Error(`Failed to fetch contact ${id}: ${res.message}`);
      }

      const contact = res.data.Contacts[0]!;

      return {
        name: `${contact.FirstName || ""} ${contact.LastName || ""}`.trim(),
        companyId: this.config.companyId,
        website: contact.Website,
        currencyCode: contact.DefaultCurrency ?? "USD",
        taxId: contact.TaxNumber,
        phone: contact.Phones?.[0]?.PhoneNumber,
        email: contact.EmailAddress?.[0],
        updatedAt: fromDotnetDate(contact.UpdatedDateUTC).toISOString()
      };
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

    const response = await this.http.requestWithRetry(method, url, {
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

  async validate(auth: ProviderCredentials): Promise<boolean> {
    if (!auth?.accessToken || !auth.tenantId) return false;
    try {
      const response = await this.request("GET", `/Organisation`);
      return !response.error;
    } catch {
      return false;
    }
  }
}
