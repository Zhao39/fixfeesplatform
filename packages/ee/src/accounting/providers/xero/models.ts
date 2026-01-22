import { z } from "zod";
import type { Accounting } from "../../core/types";

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

    EmailAddress: z.string().email().optional(),
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

export const parseDotnetDate = (date: Date | string) => {
  if (typeof date === "string") {
    const value = date.replace(/\/Date\((\d+)([-+]\d+)?\)\//, "$1");
    return new Date(parseInt(value));
  }

  return date;
};

export const transformXeroPhones = (
  contact: Xero.Contact
): Pick<
  Accounting.Contact,
  "homePhone" | "workPhone" | "mobilePhone" | "fax"
> => {
  const phones = contact.Phones ?? [];

  const homePhone = phones.find((p) => p.PhoneType === "DDI" && p.PhoneNumber);

  const workPhone = phones.find(
    (p) => p.PhoneType === "DEFAULT" && p.PhoneNumber
  );
  const mobilePhone = phones.find(
    (p) => p.PhoneType === "MOBILE" && p.PhoneNumber
  );
  const fax = phones.find((p) => p.PhoneType === "FAX" && p.PhoneNumber);

  return {
    workPhone: workPhone?.PhoneNumber,
    mobilePhone: mobilePhone?.PhoneNumber,
    homePhone: homePhone?.PhoneNumber,
    fax: fax?.PhoneNumber
  };
};

export const transformXeroContact = (
  contact: Xero.Contact,
  companyId: string
): Accounting.Contact => {
  const firstName = contact.FirstName || "";
  const lastName = contact.LastName || "";

  const addresses = contact.Addresses ?? [];

  const { workPhone, mobilePhone, homePhone } = transformXeroPhones(contact);

  return {
    id: contact.ContactID,
    name: contact.Name,
    firstName,
    lastName,
    companyId,
    website: contact.Website,
    currencyCode: contact.DefaultCurrency ?? "USD",
    taxId: contact.TaxNumber,
    email: contact.EmailAddress,
    isCustomer: contact.IsCustomer,
    isVendor: contact.IsSupplier,
    addresses: addresses.map((a) => ({
      label: a.AttentionTo,
      line1: a.AddressLine1,
      line2: a.AddressLine2,
      city: a.City,
      region: a.Region,
      country: a.Country,
      postalCode: a.PostalCode
    })),
    workPhone,
    mobilePhone,
    homePhone,
    updatedAt: parseDotnetDate(contact.UpdatedDateUTC).toISOString(),
    raw: contact
  };
};
