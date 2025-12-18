import z from "zod";

function withNullable<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (v === undefined ? null : v), schema.nullish());
}

// export const BaseEntitySchema = z.object({
//   id: z.string(),
//   externalId: z.string().optional(), // Provider-specific ID
//   createdAt: z.string().datetime(),
//   updatedAt: z.string().datetime(),
//   lastSyncedAt: z.string().datetime().optional(),
// });

export const CustomerSchema = z.object({
  name: z.string(),
  companyId: z.string(),
  phone: withNullable(z.string()),
  website: withNullable(z.string().url()),
  taxId: withNullable(z.string()),
  currencyCode: z.string().default("USD"),
  balance: z.number().nullish(),
  creditLimit: z.number().nullish(),
  paymentTerms: z.string().nullish(),
  updatedAt: z.string().datetime()
});
