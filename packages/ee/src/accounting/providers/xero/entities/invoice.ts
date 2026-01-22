import type { KyselyTx } from "@carbon/database/client";
import { sql } from "kysely";
import { type Accounting, BaseEntitySyncer } from "../../../core/types";
import { parseDotnetDate, type Xero } from "../models";

// Type for rows returned from sales invoice queries with line joins
type InvoiceRow = {
  id: string;
  invoiceId: string;
  companyId: string;
  customerId: string;
  status:
    | "Draft"
    | "Pending"
    | "Submitted"
    | "Partially Paid"
    | "Paid"
    | "Overdue"
    | "Voided"
    | "Credit Note Issued"
    | "Return";
  currencyCode: string;
  exchangeRate: number;
  dateIssued: string | null;
  dateDue: string | null;
  datePaid: string | null;
  customerReference: string | null;
  subtotal: number;
  totalTax: number;
  totalDiscount: number;
  totalAmount: number;
  balance: number;
  updatedAt: string | null;
  externalId: Record<string, unknown> | null;
};

type InvoiceLineRow = {
  id: string;
  invoiceId: string;
  invoiceLineType: string;
  itemId: string | null;
  description: string | null;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  // For item code lookup
  itemReadableIdWithRevision: string | null;
};

// Status mapping: Carbon -> Xero
const CARBON_TO_XERO_STATUS: Record<
  Accounting.SalesInvoice["status"],
  Xero.Invoice["Status"]
> = {
  Draft: "DRAFT",
  Pending: "SUBMITTED",
  Submitted: "AUTHORISED",
  "Partially Paid": "AUTHORISED",
  Paid: "PAID",
  Overdue: "AUTHORISED",
  Voided: "VOIDED",
  "Credit Note Issued": "AUTHORISED",
  Return: "AUTHORISED"
};

// Status mapping: Xero -> Carbon
const XERO_TO_CARBON_STATUS: Record<
  Xero.Invoice["Status"],
  Accounting.SalesInvoice["status"]
> = {
  DRAFT: "Draft",
  SUBMITTED: "Pending",
  AUTHORISED: "Submitted",
  PAID: "Paid",
  VOIDED: "Voided",
  DELETED: "Voided"
};

// Syncable statuses (we only push these to Xero)
const SYNCABLE_STATUSES: Accounting.SalesInvoice["status"][] = [
  "Draft",
  "Pending",
  "Submitted",
  "Partially Paid",
  "Paid",
  "Overdue"
];

export class SalesInvoiceSyncer extends BaseEntitySyncer<
  Accounting.SalesInvoice,
  Xero.Invoice,
  "UpdatedDateUTC"
> {
  // =================================================================
  // 1. ID MAPPING
  // Note: Using direct queries since salesInvoice.externalId was just added
  // via migration and types may not be regenerated yet
  // =================================================================

  async getRemoteId(localId: string): Promise<string | null> {
    const result = await this.database
      .selectFrom("salesInvoice")
      .select(sql<Record<string, unknown>>`"externalId"`.as("externalId"))
      .where("id", "=", localId)
      .where("companyId", "=", this.companyId)
      .executeTakeFirst();

    if (!result?.externalId) return null;

    const externalId = result.externalId as Record<
      string,
      { id?: string; provider?: string }
    >;
    return externalId?.[this.provider.id]?.id ?? null;
  }

  async getLocalId(remoteId: string): Promise<string | null> {
    const result = await this.database
      .selectFrom("salesInvoice")
      .select("id")
      .where("companyId", "=", this.companyId)
      .where(sql`"externalId"->${this.provider.id}->>'id'`, "=", remoteId)
      .executeTakeFirst();

    return result?.id ?? null;
  }

  protected async linkEntities(
    tx: KyselyTx,
    localId: string,
    remoteId: string
  ): Promise<void> {
    const externalIdData = {
      [this.provider.id]: {
        id: remoteId,
        provider: this.provider.id,
        lastSyncedAt: new Date().toISOString()
      }
    };

    await tx
      .updateTable("salesInvoice")
      .set({
        updatedAt: new Date().toISOString(),
        // Use raw SQL to merge externalId JSONB
        ...({
          externalId: sql`COALESCE("externalId", '{}'::jsonb) || ${JSON.stringify(
            externalIdData
          )}::jsonb`
        } as any)
      })
      .where("id", "=", localId)
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

  async fetchLocal(id: string): Promise<Accounting.SalesInvoice | null> {
    const invoices = await this.fetchInvoicesByIds([id]);
    return invoices.get(id) ?? null;
  }

  protected async fetchLocalBatch(
    ids: string[]
  ): Promise<Map<string, Accounting.SalesInvoice>> {
    return this.fetchInvoicesByIds(ids);
  }

  private async fetchInvoicesByIds(
    ids: string[]
  ): Promise<Map<string, Accounting.SalesInvoice>> {
    if (ids.length === 0) return new Map();

    // Fetch invoice headers
    const invoiceRows = await this.database
      .selectFrom("salesInvoice")
      .select([
        "salesInvoice.id",
        "salesInvoice.invoiceId",
        "salesInvoice.companyId",
        "salesInvoice.customerId",
        "salesInvoice.status",
        "salesInvoice.currencyCode",
        "salesInvoice.exchangeRate",
        "salesInvoice.dateIssued",
        "salesInvoice.dateDue",
        "salesInvoice.datePaid",
        "salesInvoice.customerReference",
        "salesInvoice.subtotal",
        "salesInvoice.totalTax",
        "salesInvoice.totalDiscount",
        "salesInvoice.totalAmount",
        "salesInvoice.balance",
        "salesInvoice.updatedAt"
      ])
      .where("salesInvoice.id", "in", ids)
      .where("salesInvoice.companyId", "=", this.companyId)
      .execute();

    if (invoiceRows.length === 0) return new Map();

    // Fetch invoice lines with item codes
    const lineRows = await this.database
      .selectFrom("salesInvoiceLine")
      .leftJoin("item", "item.id", "salesInvoiceLine.itemId")
      .select([
        "salesInvoiceLine.id",
        "salesInvoiceLine.invoiceId",
        "salesInvoiceLine.invoiceLineType",
        "salesInvoiceLine.itemId",
        "salesInvoiceLine.description",
        "salesInvoiceLine.quantity",
        "salesInvoiceLine.unitPrice",
        "salesInvoiceLine.taxPercent",
        "item.readableIdWithRevision as itemReadableIdWithRevision"
      ])
      .where(
        "salesInvoiceLine.invoiceId",
        "in",
        invoiceRows.map((r) => r.id)
      )
      .execute();

    // Group lines by invoice ID
    const linesByInvoiceId = new Map<string, InvoiceLineRow[]>();
    for (const line of lineRows as InvoiceLineRow[]) {
      const existing = linesByInvoiceId.get(line.invoiceId) ?? [];
      existing.push(line);
      linesByInvoiceId.set(line.invoiceId, existing);
    }

    // Transform to Accounting.SalesInvoice
    const result = new Map<string, Accounting.SalesInvoice>();
    for (const row of invoiceRows as InvoiceRow[]) {
      const lines = linesByInvoiceId.get(row.id) ?? [];

      result.set(row.id, {
        id: row.id,
        invoiceId: row.invoiceId,
        companyId: row.companyId,
        customerId: row.customerId,
        customerExternalId: null, // Will be resolved during mapToRemote
        status: row.status,
        currencyCode: row.currencyCode,
        exchangeRate: row.exchangeRate,
        dateIssued: row.dateIssued,
        dateDue: row.dateDue,
        datePaid: row.datePaid,
        customerReference: row.customerReference,
        subtotal: row.subtotal,
        totalTax: row.totalTax,
        totalDiscount: row.totalDiscount,
        totalAmount: row.totalAmount,
        balance: row.balance,
        lines: lines.map((line) => ({
          id: line.id,
          invoiceLineType: line.invoiceLineType,
          itemId: line.itemId,
          itemCode: line.itemReadableIdWithRevision,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxPercent: line.taxPercent,
          lineAmount: line.quantity * line.unitPrice
        })),
        updatedAt: row.updatedAt ?? new Date().toISOString(),
        raw: row
      });
    }

    return result;
  }

  // =================================================================
  // 4. REMOTE FETCH (Single + Batch) - API calls within syncer
  // =================================================================

  async fetchRemote(id: string): Promise<Xero.Invoice | null> {
    const result = await this.provider.request<{ Invoices: Xero.Invoice[] }>(
      "GET",
      `/Invoices/${id}`
    );
    return result.error ? null : (result.data?.Invoices?.[0] ?? null);
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

    if (!response.error && response.data?.Invoices) {
      for (const invoice of response.data.Invoices) {
        result.set(invoice.InvoiceID, invoice);
      }
    }

    return result;
  }

  // =================================================================
  // 5. TRANSFORMATION (Carbon -> Xero)
  // =================================================================

  protected async mapToRemote(
    local: Accounting.SalesInvoice
  ): Promise<Omit<Xero.Invoice, "UpdatedDateUTC">> {
    const existingRemoteId = await this.getRemoteId(local.id);

    // Resolve customer dependency - ensure customer is synced to Xero
    const customerRemoteId = await this.ensureDependencySynced(
      "customer",
      local.customerId
    );

    // Build line items, resolving item dependencies
    const lineItems: Xero.InvoiceLineItem[] = [];
    for (const line of local.lines) {
      const lineItem: Xero.InvoiceLineItem = {
        Description: line.description ?? undefined,
        Quantity: line.quantity,
        UnitAmount: line.unitPrice,
        TaxAmount: (line.quantity * line.unitPrice * line.taxPercent) / 100,
        LineAmount: line.quantity * line.unitPrice
      };

      // If line has an item, ensure it's synced and get the ItemCode
      if (line.itemId) {
        // Ensure item is synced
        await this.ensureDependencySynced("item", line.itemId);
        // Use the item code from Carbon (readableIdWithRevision)
        if (line.itemCode) {
          lineItem.ItemCode = line.itemCode;
        }
      }

      lineItems.push(lineItem);
    }

    return {
      InvoiceID: existingRemoteId!,
      Type: "ACCREC", // Accounts Receivable = Sales Invoice
      InvoiceNumber: local.invoiceId,
      Reference: local.customerReference ?? undefined,
      Contact: {
        ContactID: customerRemoteId
      },
      Date: local.dateIssued ?? undefined,
      DueDate: local.dateDue ?? undefined,
      Status: CARBON_TO_XERO_STATUS[local.status],
      LineAmountTypes: "Exclusive", // Tax is calculated separately
      LineItems: lineItems,
      SubTotal: local.subtotal,
      TotalTax: local.totalTax,
      Total: local.totalAmount,
      AmountDue: local.balance,
      AmountPaid: local.totalAmount - local.balance,
      CurrencyCode: local.currencyCode,
      CurrencyRate: local.exchangeRate !== 1 ? local.exchangeRate : undefined
    };
  }

  // =================================================================
  // 6. TRANSFORMATION (Xero -> Carbon) - Update only
  // =================================================================

  protected async mapToLocal(
    remote: Xero.Invoice
  ): Promise<Partial<Accounting.SalesInvoice>> {
    // Map Xero line items to Carbon line format
    const lines: Accounting.SalesInvoiceLine[] = (remote.LineItems ?? []).map(
      (line, index) => ({
        id: line.LineItemID ?? `line-${index}`,
        invoiceLineType: "Part", // Default, will be matched with existing lines
        itemId: null, // Will be resolved by looking up ItemCode
        itemCode: line.ItemCode ?? null,
        description: line.Description ?? null,
        quantity: line.Quantity ?? 0,
        unitPrice: line.UnitAmount ?? 0,
        taxPercent: line.TaxAmount
          ? (line.TaxAmount / (line.LineAmount ?? 1)) * 100 || 0
          : 0,
        lineAmount: line.LineAmount ?? 0
      })
    );

    return {
      status: XERO_TO_CARBON_STATUS[remote.Status],
      dateIssued: remote.Date ?? null,
      dateDue: remote.DueDate ?? null,
      customerReference: remote.Reference ?? null,
      subtotal: remote.SubTotal ?? 0,
      totalTax: remote.TotalTax ?? 0,
      totalAmount: remote.Total ?? 0,
      balance: remote.AmountDue ?? 0,
      currencyCode: remote.CurrencyCode ?? "USD",
      exchangeRate: remote.CurrencyRate ?? 1,
      lines
    };
  }

  // =================================================================
  // 7. UPSERT LOCAL (Update existing only - Carbon is source of truth)
  // =================================================================

  protected async upsertLocal(
    tx: KyselyTx,
    data: Partial<Accounting.SalesInvoice>,
    remoteId: string
  ): Promise<string> {
    const existingLocalId = await this.getLocalId(remoteId);

    if (!existingLocalId) {
      throw new Error(
        `Cannot create new invoices from Xero. Invoice with remote ID ${remoteId} not found locally.`
      );
    }

    const externalIdData = {
      [this.provider.id]: {
        id: remoteId,
        provider: this.provider.id,
        lastSyncedAt: new Date().toISOString()
      }
    };

    // Update invoice header using raw SQL for externalId
    await tx
      .updateTable("salesInvoice")
      .set({
        status: data.status,
        dateIssued: data.dateIssued,
        dateDue: data.dateDue,
        customerReference: data.customerReference,
        subtotal: data.subtotal,
        totalTax: data.totalTax,
        totalAmount: data.totalAmount,
        balance: data.balance,
        currencyCode: data.currencyCode,
        exchangeRate: data.exchangeRate,
        updatedAt: new Date().toISOString(),
        // Use type assertion for externalId until types are regenerated
        ...({
          externalId: sql`COALESCE("externalId", '{}'::jsonb) || ${JSON.stringify(
            externalIdData
          )}::jsonb`
        } as any)
      })
      .where("id", "=", existingLocalId)
      .execute();

    // Note: We don't update line items from Xero to preserve Carbon's line structure
    // Lines are only updated from Carbon -> Xero direction

    return existingLocalId;
  }

  // =================================================================
  // 8. UPSERT REMOTE (Single + Batch) - API calls within syncer
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

    if (result.error || !result.data?.Invoices?.[0]?.InvoiceID) {
      throw new Error(
        `Failed to ${existingRemoteId ? "update" : "create"} invoice in Xero: ${
          (result as any).message ?? "Unknown error"
        }`
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

    if (response.error || !response.data?.Invoices) {
      throw new Error(`Batch upsert failed: ${response.error}`);
    }

    for (let i = 0; i < response.data.Invoices.length; i++) {
      const returnedInvoice = response.data.Invoices[i];
      const localId = localIdOrder[i];
      if (returnedInvoice?.InvoiceID && localId) {
        result.set(localId, returnedInvoice.InvoiceID);
      }
    }

    return result;
  }

  // =================================================================
  // 9. HELPER: Check if invoice is syncable
  // =================================================================

  /**
   * Check if an invoice status is syncable to Xero
   */
  isSyncableStatus(status: Accounting.SalesInvoice["status"]): boolean {
    return SYNCABLE_STATUSES.includes(status);
  }
}
