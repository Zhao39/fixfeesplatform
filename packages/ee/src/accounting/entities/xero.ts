import { z } from "zod";

export namespace Xero {
  export const AddressSchema = z.object({
    AddressType: z.enum(["POBOX", "STREET", "DELIVERY"]),
    AddressLine1: z.string().optional(),
    AddressLine2: z.string().optional(),
    AddressLine3: z.string().optional(),
    AddressLine4: z.string().optional(),
    City: z.string().optional(),
    Region: z.string().optional(),
    PostalCode: z.string().optional(),
    Country: z.string().optional(),
    AttentionTo: z.string().optional()
  });

  export const PhoneSchema = z.object({
    PhoneType: z.enum(["DDI", "DEFAULT", "FAX", "MOBILE"]),
    PhoneNumber: z.string().optional(),
    PhoneAreaCode: z.string().optional(),
    PhoneCountryCode: z.string().optional()
  });

  export const BalancesSchema = z.object({
    AccountsReceivable: z.object({
      Outstanding: z.number(),
      Overdue: z.number()
    }),
    AccountsPayable: z.object({
      Outstanding: z.number(),
      Overdue: z.number()
    })
  });

  export const BrandingThemeSchema = z.object({
    BrandingThemeID: z.string().uuid(),
    Name: z.string()
  });

  export const BatchPaymentsSchema = z.object({
    BankAccountNumber: z.string(),
    BankAccountName: z.string(),
    Details: z.string(),
    Code: z.string().optional(),
    Reference: z.string().optional()
  });

  export const ContactSchema = z.object({
    ContactID: z.string().uuid(),
    ContactStatus: z.literal("ACTIVE"),

    Name: z.string(),
    Website: z.string().optional(),

    FirstName: z.string().optional(),
    LastName: z.string().optional(),

    EmailAddress: z.string().email().optional().or(z.literal("")),
    ContactNumber: z.string().optional(),

    BankAccountDetails: z.string().optional(),
    TaxNumber: z.string().optional(),

    AccountsReceivableTaxType: z.string().optional(),
    AccountsPayableTaxType: z.string().optional(),

    Addresses: z.array(AddressSchema),
    Phones: z.array(PhoneSchema),

    UpdatedDateUTC: z.string(), // serialized /Date(...)/

    ContactGroups: z.array(z.unknown()),

    IsSupplier: z.boolean(),
    IsCustomer: z.boolean(),

    DefaultCurrency: z.string().optional(),

    BrandingTheme: BrandingThemeSchema.optional(),
    BatchPayments: BatchPaymentsSchema.optional(),

    Balances: BalancesSchema.optional(),

    ContactPersons: z.array(z.unknown()),

    HasAttachments: z.boolean(),
    HasValidationErrors: z.boolean()
  });

  export type Contact = z.infer<typeof ContactSchema>;
}
