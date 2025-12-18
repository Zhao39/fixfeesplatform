import z from "zod";

/**
 * Provider core interfaces and base classes.
 */
export type ProviderConfig<T = unknown> = {
  id: AccountingProvider;
  companyId: string;
} & T;

export enum AccountingProvider {
  XERO = "xero",
  QUICKBOOKS = "quickbooks"
  // SAGE = "sage",
}

/**
 * Schemas for shared provider entities and credentials.
 */
export const ProviderCredentialsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("oauth2"),
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.date().optional(),
    scope: z.array(z.string()).optional(),
    tenantId: z.string().optional()
  })
]);

export type ProviderCredentials = z.output<typeof ProviderCredentialsSchema>;
