import { Accounting, Xero } from "../../entities";

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
