import type { KyselyTx } from "@carbon/database/client";
import { sql } from "kysely";
import { getAccountingEntity } from "../../../core/service";
import { type Accounting, BaseEntitySyncer } from "../../../core/types";
import { parseDotnetDate, type Xero } from "../models";

// Type for rows returned from purchaseInvoice queries
type BillRow = {
  id: string;
  companyId: string;
  invoiceId: string;
  supplierId: string | null;
  status:
    | "Draft"
    | "Pending"
    | "Submitted"
    | "Return"
    | "Debit Note Issued"
    | "Paid"
    | "Partially Paid"
    | "Overdue"
    | "Voided";
  dateIssued: string | null;
  dateDue: string | null;
  datePaid: string | null;
  currencyCode: string;
  exchangeRate: number;
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  balance: number;
  supplierReference: string | null;
  updatedAt: string | null;
  customFields: Record<string, unknown> | null;
};

// Type for rows returned from purchaseInvoiceLine queries
type BillLineRow = {
  id: string;
  invoiceId: string;
  description: string | null;
  quantity: number;
  unitPrice: number | null;
  itemId: string | null;
  accountNumber: string | null;
  taxPercent: number | null;
  taxAmount: number | null;
  totalAmount: number | null;
  itemCode: string | null;
};

// Status mapping between Carbon and Xero
const CARBON_TO_XERO_STATUS: Record<BillRow["status"], Xero.Invoice["Status"]> =
  {
    Draft: "DRAFT",
    Pending: "SUBMITTED",
    Submitted: "AUTHORISED",
    Return: "DRAFT", // No direct equivalent, map to DRAFT
    "Debit Note Issued": "AUTHORISED",
    Paid: "PAID",
    "Partially Paid": "AUTHORISED", // Xero tracks partial payment via AmountDue
    Overdue: "AUTHORISED", // Xero doesn't have overdue status
    Voided: "VOIDED"
  };

const XERO_TO_CARBON_STATUS: Record<
  Xero.Invoice["Status"],
  Accounting.Bill["status"]
> = {
  DRAFT: "Draft",
  SUBMITTED: "Pending",
  AUTHORISED: "Submitted",
  PAID: "Paid",
  VOIDED: "Voided",
  DELETED: "Voided"
};

export class BillSyncer extends BaseEntitySyncer<
  Accounting.Bill,
  Xero.Invoice,
  "UpdatedDateUTC"
> {
  // =================================================================
  // 1. ID MAPPING
  // =================================================================

  /**
   * Get the Xero InvoiceID for a local purchaseInvoice.
   * We store the external ID in the customFields JSONB column since
   * purchaseInvoice doesn't have a dedicated externalId column.
   */
  async getRemoteId(localId: string): Promise<string | null> {
    const bill = await this.database
      .selectFrom("purchaseInvoice")
      .select(["id", "customFields"])
      .where("id", "=", localId)
      .where("companyId", "=", this.companyId)
      .executeTakeFirst();

    if (!bill?.customFields) return null;

    const customFields = bill.customFields as Record<string, unknown>;
    const externalIds = customFields?.externalIds as Record<
      string,
      { id?: string }
    >;
    return externalIds?.[this.provider.id]?.id ?? null;
  }

  /**
   * Get the local purchaseInvoice ID for a Xero InvoiceID.
   */
  async getLocalId(remoteId: string): Promise<string | null> {
    const bill = await this.database
      .selectFrom("purchaseInvoice")
      .select("id")
      .where("companyId", "=", this.companyId)
      .where(
        sql`"customFields"->'externalIds'->${this.provider.id}->>'id'`,
        "=",
        remoteId
      )
      .executeTakeFirst();

    return bill?.id ?? null;
  }

  /**
   * Link a local purchaseInvoice to a Xero Invoice by storing the external ID
   * in the customFields JSONB column.
   */
  protected async linkEntities(
    tx: KyselyTx,
    localId: string,
    remoteId: string
  ): Promise<void> {
    const externalIdData = {
      externalIds: {
        [this.provider.id]: {
          id: remoteId,
          provider: this.provider.id,
          lastSyncedAt: new Date().toISOString()
        }
      }
    };

    await tx
      .updateTable("purchaseInvoice")
      .set({
        customFields: sql`COALESCE("customFields", '{}'::jsonb) || ${JSON.stringify(
          externalIdData
        )}::jsonb`
      })
      .where("id", "=", localId)
      .where("companyId", "=", this.companyId)
      .execute();
  }

  // =================================================================
  // 2. TIMESTAMP EXTRACTION
  // =================================================================

  protected getRemoteUpdatedAt(remote: Xero.Invoice): Date | null {
    if (!remote.UpdatedDateUTC) return null;
    return parseDotnetDate(remote.UpdatedDateUTC);
  }

  // =================================================================
  // 3. LOCAL FETCH (Single + Batch)
  // =================================================================

  async fetchLocal(id: string): Promise<Accounting.Bill | null> {
    const bills = await this.fetchBillsByIds([id]);
    return bills.get(id) ?? null;
  }

  protected async fetchLocalBatch(
    ids: string[]
  ): Promise<Map<string, Accounting.Bill>> {
    if (ids.length === 0) return new Map();
    return this.fetchBillsByIds(ids);
  }

  private async fetchBillsByIds(
    ids: string[]
  ): Promise<Map<string, Accounting.Bill>> {
    if (ids.length === 0) return new Map();

    // Fetch bills
    const billRows = await this.database
      .selectFrom("purchaseInvoice")
      .select([
        "id",
        "companyId",
        "invoiceId",
        "supplierId",
        "status",
        "dateIssued",
        "dateDue",
        "datePaid",
        "currencyCode",
        "exchangeRate",
        "subtotal",
        "totalTax",
        "totalDiscount",
        "totalAmount",
        "balance",
        "supplierReference",
        "updatedAt",
        "customFields"
      ])
      .where("id", "in", ids)
      .where("companyId", "=", this.companyId)
      .execute();

    if (billRows.length === 0) return new Map();

    // Fetch lines for all bills
    const billIds = billRows.map((b) => b.id);
    const lineRows = await this.database
      .selectFrom("purchaseInvoiceLine")
      .leftJoin("item", "item.id", "purchaseInvoiceLine.itemId")
      .select([
        "purchaseInvoiceLine.id",
        "purchaseInvoiceLine.invoiceId",
        "purchaseInvoiceLine.description",
        "purchaseInvoiceLine.quantity",
        "purchaseInvoiceLine.unitPrice",
        "purchaseInvoiceLine.itemId",
        "purchaseInvoiceLine.accountNumber",
        "purchaseInvoiceLine.taxPercent",
        "purchaseInvoiceLine.taxAmount",
        "purchaseInvoiceLine.totalAmount",
        "item.readableId as itemCode"
      ])
      .where("purchaseInvoiceLine.invoiceId", "in", billIds)
      .execute();

    // Fetch supplier external IDs for mapping
    const supplierIds = billRows
      .map((b) => b.supplierId)
      .filter((id): id is string => id !== null);

    const supplierExternalIds = new Map<string, string | null>();
    if (supplierIds.length > 0) {
      const suppliers = await this.database
        .selectFrom("supplier")
        .select(["id", "externalId"])
        .where("id", "in", supplierIds)
        .execute();

      for (const supplier of suppliers) {
        const externalId = supplier.externalId as Record<
          string,
          { id?: string }
        > | null;
        supplierExternalIds.set(
          supplier.id,
          externalId?.[this.provider.id]?.id ?? null
        );
      }
    }

    // Group lines by invoice
    const linesByInvoice = new Map<string, BillLineRow[]>();
    for (const line of lineRows) {
      const existing = linesByInvoice.get(line.invoiceId) ?? [];
      existing.push(line as BillLineRow);
      linesByInvoice.set(line.invoiceId, existing);
    }

    // Transform to Accounting.Bill
    const result = new Map<string, Accounting.Bill>();
    for (const row of billRows) {
      const lines = linesByInvoice.get(row.id) ?? [];
      result.set(row.id, {
        id: row.id,
        companyId: row.companyId,
        invoiceId: row.invoiceId,
        supplierId: row.supplierId,
        supplierExternalId: row.supplierId
          ? (supplierExternalIds.get(row.supplierId) ?? null)
          : null,
        status: row.status,
        dateIssued: row.dateIssued,
        dateDue: row.dateDue,
        datePaid: row.datePaid,
        currencyCode: row.currencyCode,
        exchangeRate: row.exchangeRate,
        subtotal: row.subtotal,
        totalTax: row.totalTax,
        totalDiscount: row.totalDiscount,
        totalAmount: row.totalAmount,
        balance: row.balance,
        supplierReference: row.supplierReference,
        lines: lines.map((line) => ({
          id: line.id,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice ?? 0,
          itemId: line.itemId,
          itemCode: line.itemCode,
          accountNumber: line.accountNumber,
          taxPercent: line.taxPercent,
          taxAmount: line.taxAmount,
          totalAmount: line.totalAmount ?? 0
        })),
        updatedAt: row.updatedAt ?? new Date().toISOString(),
        raw: row
      });
    }

    return result;
  }

  // =================================================================
  // 4. REMOTE FETCH (Single + Batch)
  // =================================================================

  async fetchRemote(id: string): Promise<Xero.Invoice | null> {
    const result = await this.provider.request<{ Invoices: Xero.Invoice[] }>(
      "GET",
      `/Invoices/${id}`
    );

    if (result.error) return null;

    const data = result.data as { Invoices: Xero.Invoice[] } | undefined;
    const invoice = data?.Invoices?.[0];

    // Only return if it's a Bill (ACCPAY)
    if (!invoice || invoice.Type !== "ACCPAY") {
      return null;
    }

    return invoice;
  }

  protected async fetchRemoteBatch(
    ids: string[]
  ): Promise<Map<string, Xero.Invoice>> {
    const result = new Map<string, Xero.Invoice>();
    if (ids.length === 0) return result;

    const response = await this.provider.request<{ Invoices: Xero.Invoice[] }>(
      "GET",
      `/Invoices?IDs=${ids.join(",")}`
    );

    if (response.error) return result;

    const data = response.data as { Invoices: Xero.Invoice[] } | undefined;
    for (const invoice of data?.Invoices ?? []) {
      // Only include Bills (ACCPAY)
      if (invoice.Type === "ACCPAY") {
        result.set(invoice.InvoiceID, invoice);
      }
    }

    return result;
  }

  // =================================================================
  // 5. TRANSFORMATION (Carbon -> Xero)
  // =================================================================

  protected async mapToRemote(
    local: Accounting.Bill
  ): Promise<Omit<Xero.Invoice, "UpdatedDateUTC">> {
    const existingRemoteId = await this.getRemoteId(local.id);

    // Get supplier's Xero ContactID - ensure supplier is synced first
    let contactId = local.supplierExternalId;
    if (!contactId && local.supplierId) {
      contactId = await this.ensureDependencySynced("vendor", local.supplierId);
    }

    if (!contactId) {
      throw new Error(
        `Cannot sync bill ${local.id}: No supplier linked or supplier not synced to Xero`
      );
    }

    // Map line items
    const lineItems: Xero.InvoiceLineItem[] = await Promise.all(
      local.lines.map(async (line) => {
        let itemCode = line.itemCode;

        // If we have an itemId but no itemCode, try to get it from the synced item
        if (!itemCode && line.itemId) {
          const itemLink = await getAccountingEntity(
            this.database,
            "item",
            this.companyId,
            this.provider.id,
            { id: line.itemId }
          );
          if (itemLink) {
            // Item is synced, get its code
            const item = await this.database
              .selectFrom("item")
              .select("readableId")
              .where("id", "=", line.itemId)
              .executeTakeFirst();
            itemCode = item?.readableId ?? null;
          }
        }

        return {
          Description: line.description ?? undefined,
          Quantity: line.quantity,
          UnitAmount: line.unitPrice,
          ItemCode: itemCode ?? undefined,
          AccountCode: line.accountNumber ?? undefined,
          TaxAmount: line.taxAmount ?? undefined,
          LineAmount: line.totalAmount
        };
      })
    );

    return {
      InvoiceID: existingRemoteId!,
      Type: "ACCPAY",
      InvoiceNumber: local.invoiceId,
      Reference: local.supplierReference ?? undefined,
      Contact: { ContactID: contactId },
      Date: local.dateIssued ?? undefined,
      DueDate: local.dateDue ?? undefined,
      Status: CARBON_TO_XERO_STATUS[local.status],
      CurrencyCode: local.currencyCode,
      CurrencyRate: local.exchangeRate !== 1 ? local.exchangeRate : undefined,
      LineItems: lineItems,
      SubTotal: local.subtotal,
      TotalTax: local.totalTax,
      Total: local.totalAmount
    };
  }

  // =================================================================
  // 6. TRANSFORMATION (Xero -> Carbon)
  // =================================================================

  protected async mapToLocal(
    remote: Xero.Invoice
  ): Promise<Partial<Accounting.Bill>> {
    // Determine Carbon status based on Xero status and amounts
    let status = XERO_TO_CARBON_STATUS[remote.Status];

    // Check for partial payment
    if (
      remote.Status === "AUTHORISED" &&
      remote.AmountPaid &&
      remote.AmountPaid > 0 &&
      remote.AmountDue &&
      remote.AmountDue > 0
    ) {
      status = "Partially Paid";
    }

    // Check for overdue (would need to compare DueDate with current date)
    if (
      remote.Status === "AUTHORISED" &&
      remote.DueDate &&
      new Date(remote.DueDate) < new Date()
    ) {
      status = "Overdue";
    }

    // Map line items
    const lines: Accounting.BillLine[] = (remote.LineItems ?? []).map(
      (line, index) => ({
        id: line.LineItemID ?? `temp-${index}`,
        description: line.Description ?? null,
        quantity: line.Quantity ?? 1,
        unitPrice: line.UnitAmount ?? 0,
        itemId: null, // Will be resolved during upsertLocal if ItemCode matches
        itemCode: line.ItemCode ?? null,
        accountNumber: line.AccountCode ?? null,
        taxPercent: null,
        taxAmount: line.TaxAmount ?? null,
        totalAmount: line.LineAmount ?? 0
      })
    );

    return {
      invoiceId: remote.InvoiceNumber ?? remote.InvoiceID,
      supplierExternalId: remote.Contact.ContactID,
      status,
      dateIssued: remote.Date ?? null,
      dateDue: remote.DueDate ?? null,
      datePaid: remote.Status === "PAID" ? new Date().toISOString() : null,
      currencyCode: remote.CurrencyCode ?? "USD",
      exchangeRate: remote.CurrencyRate ?? 1,
      subtotal: remote.SubTotal ?? 0,
      totalTax: remote.TotalTax ?? 0,
      totalDiscount: 0,
      totalAmount: remote.Total ?? 0,
      balance: remote.AmountDue ?? 0,
      supplierReference: remote.Reference ?? null,
      lines,
      updatedAt: remote.UpdatedDateUTC
        ? parseDotnetDate(remote.UpdatedDateUTC).toISOString()
        : new Date().toISOString()
    };
  }

  // =================================================================
  // 7. UPSERT LOCAL
  // =================================================================

  protected async upsertLocal(
    tx: KyselyTx,
    data: Partial<Accounting.Bill>,
    remoteId: string
  ): Promise<string> {
    const existingLocalId = await this.getLocalId(remoteId);

    // Resolve supplier from Xero ContactID
    let supplierId: string | null = null;
    if (data.supplierExternalId) {
      const supplier = await getAccountingEntity(
        tx,
        "supplier",
        this.companyId,
        this.provider.id,
        { externalId: data.supplierExternalId }
      );
      supplierId = supplier?.id ?? null;
    }

    const externalIdData = {
      externalIds: {
        [this.provider.id]: {
          id: remoteId,
          provider: this.provider.id,
          lastSyncedAt: new Date().toISOString()
        }
      }
    };

    if (existingLocalId) {
      // Update existing purchase invoice
      await tx
        .updateTable("purchaseInvoice")
        .set({
          supplierId,
          status: data.status,
          dateIssued: data.dateIssued,
          dateDue: data.dateDue,
          datePaid: data.datePaid,
          currencyCode: data.currencyCode,
          exchangeRate: data.exchangeRate,
          subtotal: data.subtotal,
          totalTax: data.totalTax,
          totalDiscount: data.totalDiscount,
          totalAmount: data.totalAmount,
          balance: data.balance,
          supplierReference: data.supplierReference,
          updatedAt: new Date().toISOString(),
          customFields: sql`COALESCE("customFields", '{}'::jsonb) || ${JSON.stringify(
            externalIdData
          )}::jsonb`
        })
        .where("id", "=", existingLocalId)
        .where("companyId", "=", this.companyId)
        .execute();

      // Update lines - delete existing and recreate
      await this.upsertLines(tx, existingLocalId, data.lines ?? []);

      return existingLocalId;
    }

    // For new bills from Xero, we need to create them
    // This requires more context (supplierInteractionId, createdBy, etc.)
    throw new Error(
      `Cannot create new purchase invoice from Xero. Invoice with ID ${remoteId} must be created in Carbon first and then synced.`
    );
  }

  private async upsertLines(
    tx: KyselyTx,
    invoiceId: string,
    lines: Accounting.BillLine[]
  ): Promise<void> {
    // Delete existing lines
    await tx
      .deleteFrom("purchaseInvoiceLine")
      .where("invoiceId", "=", invoiceId)
      .execute();

    if (lines.length === 0) return;

    // Resolve item IDs from item codes
    const itemCodes = lines
      .map((l) => l.itemCode)
      .filter((code): code is string => code !== null);

    const itemMap = new Map<string, string>();
    if (itemCodes.length > 0) {
      const items = await tx
        .selectFrom("item")
        .select(["id", "readableId"])
        .where("readableId", "in", itemCodes)
        .where("companyId", "=", this.companyId)
        .execute();

      for (const item of items) {
        itemMap.set(item.readableId, item.id);
      }
    }

    // Get the invoice to get companyId and createdBy
    const invoice = await tx
      .selectFrom("purchaseInvoice")
      .select(["companyId", "createdBy", "exchangeRate"])
      .where("id", "=", invoiceId)
      .executeTakeFirstOrThrow();

    // Insert new lines
    for (const line of lines) {
      const itemId = line.itemCode
        ? (itemMap.get(line.itemCode) ?? null)
        : null;

      await tx
        .insertInto("purchaseInvoiceLine")
        .values({
          invoiceId,
          companyId: invoice.companyId,
          createdBy: invoice.createdBy,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          supplierUnitPrice: line.unitPrice,
          itemId,
          accountNumber: line.accountNumber,
          taxPercent: line.taxPercent,
          taxAmount: line.taxAmount,
          supplierTaxAmount: line.taxAmount ?? 0,
          totalAmount: line.totalAmount,
          supplierExtendedPrice: line.totalAmount,
          exchangeRate: invoice.exchangeRate,
          invoiceLineType: itemId ? "Part" : "G/L Account",
          supplierShippingCost: 0
        })
        .execute();
    }
  }

  // =================================================================
  // 8. UPSERT REMOTE (Single + Batch)
  // =================================================================

  protected async upsertRemote(
    data: Omit<Xero.Invoice, "UpdatedDateUTC">,
    localId: string
  ): Promise<string> {
    const existingRemoteId = await this.getRemoteId(localId);
    const invoices = existingRemoteId
      ? [{ ...data, InvoiceID: existingRemoteId }]
      : [data];

    const result = await this.provider.request<{ Invoices: Xero.Invoice[] }>(
      "POST",
      "/Invoices",
      { body: JSON.stringify({ Invoices: invoices }) }
    );

    if (result.error) {
      const errorMessage =
        (result as any).message ?? (result as any).data ?? "Unknown error";
      throw new Error(
        `Failed to ${
          existingRemoteId ? "update" : "create"
        } bill in Xero: ${errorMessage}`
      );
    }

    if (!result.data?.Invoices?.[0]?.InvoiceID) {
      throw new Error(
        `Failed to ${
          existingRemoteId ? "update" : "create"
        } bill in Xero: No invoice ID returned`
      );
    }

    return result.data.Invoices[0].InvoiceID;
  }

  protected async upsertRemoteBatch(
    data: Array<{
      localId: string;
      payload: Omit<Xero.Invoice, "UpdatedDateUTC">;
    }>
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    if (data.length === 0) return result;

    const invoices: Xero.Invoice[] = [];
    const localIdOrder: string[] = [];

    for (const { localId, payload } of data) {
      const existingRemoteId = await this.getRemoteId(localId);
      invoices.push(
        existingRemoteId
          ? ({ ...payload, InvoiceID: existingRemoteId } as Xero.Invoice)
          : (payload as Xero.Invoice)
      );
      localIdOrder.push(localId);
    }

    const response = await this.provider.request<{ Invoices: Xero.Invoice[] }>(
      "POST",
      "/Invoices",
      { body: JSON.stringify({ Invoices: invoices }) }
    );

    if (response.error || !response.data) {
      throw new Error(
        `Batch upsert failed: ${(response as any).message ?? "Unknown error"}`
      );
    }

    const returnedInvoices = (response.data as { Invoices: Xero.Invoice[] })
      .Invoices;
    if (!returnedInvoices) {
      throw new Error(`Batch upsert failed: No invoices returned`);
    }

    for (let i = 0; i < returnedInvoices.length; i++) {
      const returnedInvoice = returnedInvoices[i];
      const localId = localIdOrder[i];
      if (returnedInvoice?.InvoiceID && localId) {
        result.set(localId, returnedInvoice.InvoiceID);
      }
    }

    return result;
  }
}
