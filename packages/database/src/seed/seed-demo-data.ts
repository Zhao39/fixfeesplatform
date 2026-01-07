/**
 * Demo Seeding using Kysely
 *
 * This module handles demo data seeding with Kysely queries.
 * Benefits:
 * - Full type safety and autocompletion
 * - Transactions for atomicity
 * - Easier to test and mock
 * - Can run from Node.js directly
 * - Better error handling and debugging
 */

import { Kysely, sql, Transaction } from "kysely";
import { v5 as uuidv5 } from "uuid";
import type { DemoModule, Industry } from "./demo";

// Fixed namespace UUID for demo data (matches what was in SQL)
// This ensures deterministic UUIDs: same company_id + template_row_id = same UUID
const DEMO_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

// ============================================================================
// Demo Templates Schema Types
// ============================================================================

/**
 * Type definitions for the demo_templates schema tables.
 * This allows us to use type-safe Kysely queries with .withSchema("demo_templates")
 */
interface DemoTemplatesSchema {
  customer: {
    templateSetId: string;
    templateRowId: string;
    name: string;
    customerTypeId: string | null;
    customerStatusId: string | null;
    taxId: string | null;
    accountManagerId: string | null;
  };
  supplier: {
    templateSetId: string;
    templateRowId: string;
    name: string;
    supplierTypeId: string | null;
    supplierStatusId: string | null;
    taxId: string | null;
    accountManagerId: string | null;
  };
  item: {
    templateSetId: string;
    templateRowId: string;
    readableId: string;
    name: string;
    description: string | null;
    type: string;
    itemTrackingType: string;
    replenishmentSystem: string;
    unitOfMeasureCode: string | null;
    revision: string | null;
    active: boolean;
  };
  part: {
    templateSetId: string;
    templateRowId: string;
    approved: boolean;
    fromDate: string | null;
    toDate: string | null;
  };
  quote: {
    templateSetId: string;
    templateRowId: string;
    quoteId: string;
    tplCustomerId: string;
    status: string;
    expirationDate: string | null;
    customerReference: string | null;
  };
  quoteLine: {
    templateSetId: string;
    templateRowId: string;
    tplQuoteId: string;
    tplItemId: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
  };
  purchaseOrder: {
    templateSetId: string;
    templateRowId: string;
    purchaseOrderId: string;
    tplSupplierId: string;
    purchaseOrderType: string;
    status: string;
    orderDate: string;
    receiptPromisedDate: string | null;
    receiptRequestedDate: string | null;
  };
  purchaseOrderLine: {
    templateSetId: string;
    templateRowId: string;
    tplPurchaseOrderId: string;
    tplItemId: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    receiptPromisedDate: string | null;
    receiptRequestedDate: string | null;
  };
}

// Extended types for joined queries
interface TemplateQuoteLineWithItem {
  templateSetId: string;
  templateRowId: string;
  tplQuoteId: string;
  tplItemId: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  itemType: string;
  replenishmentSystem: string;
}

interface TemplatePurchaseOrderLineWithItem {
  templateSetId: string;
  templateRowId: string;
  tplPurchaseOrderId: string;
  tplItemId: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  receiptPromisedDate: string | null;
  receiptRequestedDate: string | null;
  itemType: string;
}

/**
 * Generate a deterministic UUID for demo data.
 * Uses uuid v5 with a fixed namespace.
 * Same company_id + template_row_id always produces the same UUID.
 */
export function generateDemoId(
  companyId: string,
  templateRowId: string
): string {
  const name = `${companyId}::${templateRowId}`;
  return uuidv5(name, DEMO_NAMESPACE);
}

interface SeedDemoOptions {
  companyId: string;
  industryId: Industry;
  moduleIds: DemoModule[];
  seededBy: string;
}

interface SeedModuleOptions {
  companyId: string;
  templateSetId: string;
  seededBy: string;
}

// Map of code to name for common unit of measures
const UOM_CODE_TO_NAME: Record<string, string> = {
  EA: "Each",
  CS: "Case",
  PK: "Pack",
  PL: "Pallet",
  RL: "Roll",
  BX: "Box",
  BG: "Bag",
  DR: "Drum",
  GL: "Gallon",
  GAL: "Gallon",
  LT: "Liter",
  OZ: "Ounce",
  LB: "Pound",
  TN: "Ton",
  YD: "Yard",
  MT: "Meter",
  FT: "Foot",
  SET: "Set",
  "SQ FT": "Square Foot",
  BOX: "Box",
  ROLL: "Roll"
};

/**
 * Main demo seeding class using Kysely with transactions
 */
export class DemoSeeder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private db: Kysely<any>) {}

  /**
   * Helper to get the demo_templates schema with type safety
   */
  private get templates() {
    return this.db.withSchema(
      "demo_templates"
    ) as unknown as Kysely<DemoTemplatesSchema>;
  }

  /**
   * Helper to get the demo_templates schema within a transaction
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getTemplates(trx: Transaction<any>) {
    return trx.withSchema(
      "demo_templates"
    ) as unknown as Kysely<DemoTemplatesSchema>;
  }

  /**
   * Get a user from the company to use as createdBy
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getCompanyUser(
    dbOrTrx: Kysely<any> | Transaction<any>,
    companyId: string
  ): Promise<string> {
    const result = await dbOrTrx
      .selectFrom("userToCompany")
      .select("userId")
      .where("companyId", "=", companyId)
      .limit(1)
      .executeTakeFirst();

    if (!result) {
      throw new Error(`No users found for company ${companyId}`);
    }
    return result.userId;
  }

  /**
   * Ensure unitOfMeasure records exist for template items
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async ensureUnitOfMeasures(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string
  ): Promise<void> {
    const userId = await this.getCompanyUser(trx, companyId);
    const templates = this.getTemplates(trx);

    // Get all unique unitOfMeasure codes from template items
    const templateItems = await templates
      .selectFrom("item")
      .select("unitOfMeasureCode")
      .distinct()
      .where("templateSetId", "=", templateSetId)
      .where("unitOfMeasureCode", "is not", null)
      .execute();

    if (templateItems.length === 0) {
      return;
    }

    // Get existing unitOfMeasure codes for this company
    const existing = await trx
      .selectFrom("unitOfMeasure")
      .select("code")
      .where("companyId", "=", companyId)
      .execute();

    const existingCodes = new Set(existing.map((uom) => uom.code));

    // Create missing unitOfMeasure records
    const toCreate = templateItems
      .map((row) => row.unitOfMeasureCode)
      .filter(
        (code): code is string => code !== null && !existingCodes.has(code)
      )
      .map((code) => ({
        code,
        name: UOM_CODE_TO_NAME[code] || code,
        companyId,
        active: true,
        createdBy: userId
      }));

    if (toCreate.length > 0) {
      await trx
        .insertInto("unitOfMeasure")
        .values(toCreate)
        .onConflict((oc) => oc.columns(["code", "companyId"]).doNothing())
        .execute();
    }
  }

  /**
   * Get the template set ID for a given industry and module
   */
  private async getTemplateSetId(
    industryId: Industry,
    moduleId: DemoModule
  ): Promise<string> {
    const result = await this.db
      .selectFrom("templateSet")
      .select("id")
      .where("industryId", "=", industryId)
      .where("moduleId", "=", moduleId)
      .where("isSystem", "=", true)
      .orderBy("version", "desc")
      .limit(1)
      .executeTakeFirst();

    if (!result) {
      throw new Error(
        `No enabled system template_set for industry=${industryId}, module=${moduleId}`
      );
    }
    return result.id;
  }

  /**
   * Seed demo data for multiple modules
   */
  async seedDemo(options: SeedDemoOptions): Promise<void> {
    const { companyId, industryId, moduleIds, seededBy } = options;

    for (const moduleId of moduleIds) {
      const templateSetId = await this.getTemplateSetId(industryId, moduleId);
      await this.seedModule({ companyId, templateSetId, seededBy }, moduleId);
    }
  }

  /**
   * Seed a single module within a transaction
   */
  private async seedModule(
    options: SeedModuleOptions,
    moduleId: DemoModule
  ): Promise<void> {
    const { companyId, templateSetId, seededBy } = options;

    // Update or insert seed state (before transaction)
    await this.db
      .insertInto("demoSeedState")
      .values({
        companyId,
        moduleId,
        templateSetId,
        status: "running",
        seededBy
      })
      .onConflict((oc) =>
        oc.columns(["companyId", "moduleId"]).doUpdateSet({
          templateSetId,
          status: "running",
          seededBy,
          lastError: null
        })
      )
      .execute();

    try {
      // Run the seeding in a transaction for atomicity
      await this.db.transaction().execute(async (trx) => {
        switch (moduleId) {
          case "Sales":
            await this.seedSalesDemoInTransaction(
              trx,
              companyId,
              templateSetId
            );
            break;
          case "Purchasing":
            await this.seedPurchasingDemoInTransaction(
              trx,
              companyId,
              templateSetId
            );
            break;
          case "Parts":
            await this.seedPartsDemoInTransaction(
              trx,
              companyId,
              templateSetId
            );
            break;
          case "Inventory":
            await this.seedInventoryDemoInTransaction(
              trx,
              companyId,
              templateSetId
            );
            break;
          default:
            throw new Error(`No seeder registered for moduleId=${moduleId}`);
        }
      });

      // Mark as done (after successful transaction)
      await this.db
        .updateTable("demoSeedState")
        .set({
          status: "done",
          seededAt: sql`NOW()`
        })
        .where("companyId", "=", companyId)
        .where("moduleId", "=", moduleId)
        .execute();
    } catch (error) {
      // Mark as failed
      await this.db
        .updateTable("demoSeedState")
        .set({
          status: "failed",
          lastError: (error as Error).message
        })
        .where("companyId", "=", companyId)
        .where("moduleId", "=", moduleId)
        .execute();
      throw error;
    }
  }

  /**
   * Seed Sales demo data within a transaction
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async seedSalesDemoInTransaction(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string
  ): Promise<void> {
    const userId = await this.getCompanyUser(trx, companyId);
    const templates = this.getTemplates(trx);

    // 1. Get and seed template customers
    const templateCustomers = await templates
      .selectFrom("customer")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templateCustomers) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);

      await trx
        .insertInto("customer")
        .values({
          id: demoId,
          companyId,
          name: tpl.name,
          customerTypeId: tpl.customerTypeId,
          customerStatusId: tpl.customerStatusId,
          taxId: tpl.taxId,
          accountManagerId: userId,
          isDemo: true,
          createdBy: userId
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    // 2. Ensure unitOfMeasure records exist before seeding items
    await this.ensureUnitOfMeasures(trx, companyId, templateSetId);

    // 3. Get and seed template items
    const templateItems = await templates
      .selectFrom("item")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templateItems) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);

      await trx
        .insertInto("item")
        .values({
          id: demoId,
          companyId,
          readableId: tpl.readableId,
          name: tpl.name,
          description: tpl.description,
          type: sql`${tpl.type}::"itemType"`,
          itemTrackingType: sql`${tpl.itemTrackingType}::"itemTrackingType"`,
          replenishmentSystem: sql`${tpl.replenishmentSystem}::"itemReplenishmentSystem"`,
          unitOfMeasureCode: tpl.unitOfMeasureCode,
          revision: tpl.revision,
          active: tpl.active,
          isDemo: true,
          createdBy: userId
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    // 4. Get and seed template quotes
    const templateQuotes = await templates
      .selectFrom("quote")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templateQuotes) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);
      const oppId = generateDemoId(companyId, `opp_${tpl.templateRowId}`);
      const customerId = generateDemoId(companyId, tpl.tplCustomerId);

      // Create opportunity for the quote
      await trx
        .insertInto("opportunity")
        .values({
          id: oppId,
          companyId,
          customerId,
          isDemo: true
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();

      await trx
        .insertInto("quote")
        .values({
          id: demoId,
          companyId,
          quoteId: tpl.quoteId,
          customerId,
          opportunityId: oppId,
          status: sql`${tpl.status}::"quoteStatus"`,
          expirationDate: tpl.expirationDate,
          customerReference: tpl.customerReference,
          isDemo: true,
          createdBy: userId,
          revisionId: 0,
          currencyCode: "USD",
          exchangeRate: 1.0
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    // 5. Get and seed template quote lines with item data (using join)
    const templateQuoteLines = (await templates
      .selectFrom("quoteLine as ql")
      .innerJoin("item as it", (join) =>
        join
          .onRef("it.templateSetId", "=", "ql.templateSetId")
          .onRef("it.templateRowId", "=", "ql.tplItemId")
      )
      .select([
        "ql.templateSetId",
        "ql.templateRowId",
        "ql.tplQuoteId",
        "ql.tplItemId",
        "ql.description",
        "ql.quantity",
        "ql.unitPrice",
        "it.type as itemType",
        "it.replenishmentSystem"
      ])
      .where("ql.templateSetId", "=", templateSetId)
      .execute()) as TemplateQuoteLineWithItem[];

    for (const tpl of templateQuoteLines) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);
      const quoteId = generateDemoId(companyId, tpl.tplQuoteId);
      const itemId = generateDemoId(companyId, tpl.tplItemId);

      // Map replenishmentSystem to methodType
      const methodType = tpl.replenishmentSystem === "Buy" ? "Buy" : "Make";

      await trx
        .insertInto("quoteLine")
        .values({
          id: demoId,
          companyId,
          quoteId,
          quoteRevisionId: 0,
          itemId,
          itemType: sql`${tpl.itemType}::"itemType"`,
          description: tpl.description,
          quantity: sql`ARRAY[${tpl.quantity}]::NUMERIC(20, 2)[]`,
          methodType: sql`${methodType}::"methodType"`,
          isDemo: true,
          createdBy: userId
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();

      // 6. Seed quote line prices
      await trx
        .insertInto("quoteLinePrice")
        .values({
          quoteLineId: demoId,
          quoteId,
          quantity: tpl.quantity,
          unitPrice: tpl.unitPrice,
          discountPercent: 0,
          leadTime: 0,
          shippingCost: 0,
          createdBy: userId
        })
        .onConflict((oc) => oc.columns(["quoteLineId", "quantity"]).doNothing())
        .execute();
    }
  }

  /**
   * Seed Purchasing demo data within a transaction
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async seedPurchasingDemoInTransaction(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string
  ): Promise<void> {
    const userId = await this.getCompanyUser(trx, companyId);
    const templates = this.getTemplates(trx);

    // 1. Get and seed template suppliers
    const templateSuppliers = await templates
      .selectFrom("supplier")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templateSuppliers) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);

      await trx
        .insertInto("supplier")
        .values({
          id: demoId,
          companyId,
          name: tpl.name,
          supplierTypeId: tpl.supplierTypeId,
          supplierStatusId: tpl.supplierStatusId,
          taxId: tpl.taxId,
          accountManagerId: userId,
          isDemo: true,
          createdBy: userId
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    // 2. Ensure unitOfMeasure records exist before seeding items
    await this.ensureUnitOfMeasures(trx, companyId, templateSetId);

    // 3. Get and seed template items (if not already seeded)
    const templateItems = await templates
      .selectFrom("item")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templateItems) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);

      await trx
        .insertInto("item")
        .values({
          id: demoId,
          companyId,
          readableId: tpl.readableId,
          name: tpl.name,
          description: tpl.description,
          type: sql`${tpl.type}::"itemType"`,
          itemTrackingType: sql`${tpl.itemTrackingType}::"itemTrackingType"`,
          replenishmentSystem: sql`${tpl.replenishmentSystem}::"itemReplenishmentSystem"`,
          unitOfMeasureCode: tpl.unitOfMeasureCode,
          revision: tpl.revision,
          active: tpl.active,
          isDemo: true,
          createdBy: userId
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    // 4. Get and seed template purchase orders
    const templatePurchaseOrders = await templates
      .selectFrom("purchaseOrder")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templatePurchaseOrders) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);
      const supplierId = generateDemoId(companyId, tpl.tplSupplierId);

      // Create supplier interaction
      await trx
        .insertInto("supplierInteraction")
        .values({
          id: demoId,
          companyId,
          supplierId,
          isDemo: true
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();

      // Create purchase order
      await trx
        .insertInto("purchaseOrder")
        .values({
          id: demoId,
          companyId,
          purchaseOrderId: tpl.purchaseOrderId,
          supplierId,
          purchaseOrderType: sql`${tpl.purchaseOrderType}::"purchaseOrderType"`,
          status: sql`${tpl.status}::"purchaseOrderStatus"`,
          orderDate: tpl.orderDate,
          supplierInteractionId: demoId,
          isDemo: true,
          createdBy: userId,
          currencyCode: "USD",
          exchangeRate: 1.0
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();

      // Create purchase order delivery
      await trx
        .insertInto("purchaseOrderDelivery")
        .values({
          id: demoId,
          companyId,
          receiptRequestedDate: tpl.receiptRequestedDate,
          receiptPromisedDate: tpl.receiptPromisedDate,
          updatedBy: userId
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();

      // Create purchase order payment
      await trx
        .insertInto("purchaseOrderPayment")
        .values({
          id: demoId,
          companyId,
          updatedBy: userId
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    // 5. Get and seed template purchase order lines with item data (using join)
    const templatePOLines = (await templates
      .selectFrom("purchaseOrderLine as pol")
      .innerJoin("item as it", (join) =>
        join
          .onRef("it.templateSetId", "=", "pol.templateSetId")
          .onRef("it.templateRowId", "=", "pol.tplItemId")
      )
      .select([
        "pol.templateSetId",
        "pol.templateRowId",
        "pol.tplPurchaseOrderId",
        "pol.tplItemId",
        "pol.description",
        "pol.quantity",
        "pol.unitPrice",
        "pol.receiptPromisedDate",
        "pol.receiptRequestedDate",
        "it.type as itemType"
      ])
      .where("pol.templateSetId", "=", templateSetId)
      .execute()) as TemplatePurchaseOrderLineWithItem[];

    for (const tpl of templatePOLines) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);
      const purchaseOrderId = generateDemoId(companyId, tpl.tplPurchaseOrderId);
      const itemId = generateDemoId(companyId, tpl.tplItemId);

      // Map item type to purchaseOrderLineType
      const validTypes = [
        "Part",
        "Material",
        "Tool",
        "Service",
        "Consumable",
        "Fixture"
      ];
      const lineType = validTypes.includes(tpl.itemType)
        ? tpl.itemType
        : "Part";

      await trx
        .insertInto("purchaseOrderLine")
        .values({
          id: demoId,
          companyId,
          purchaseOrderId,
          purchaseOrderLineType: sql`${lineType}::"purchaseOrderLineType"`,
          itemId,
          description: tpl.description,
          purchaseQuantity: tpl.quantity,
          supplierUnitPrice: tpl.unitPrice,
          promisedDate: tpl.receiptPromisedDate,
          isDemo: true,
          createdBy: userId,
          exchangeRate: 1.0
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }
  }

  /**
   * Seed Parts demo data within a transaction
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async seedPartsDemoInTransaction(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string
  ): Promise<void> {
    const userId = await this.getCompanyUser(trx, companyId);
    const templates = this.getTemplates(trx);

    // 1. Ensure unitOfMeasure records exist before seeding items
    await this.ensureUnitOfMeasures(trx, companyId, templateSetId);

    // 2. Get and seed template items (if not already seeded)
    const templateItems = await templates
      .selectFrom("item")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templateItems) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);

      await trx
        .insertInto("item")
        .values({
          id: demoId,
          companyId,
          readableId: tpl.readableId,
          name: tpl.name,
          description: tpl.description,
          type: sql`${tpl.type}::"itemType"`,
          itemTrackingType: sql`${tpl.itemTrackingType}::"itemTrackingType"`,
          replenishmentSystem: sql`${tpl.replenishmentSystem}::"itemReplenishmentSystem"`,
          unitOfMeasureCode: tpl.unitOfMeasureCode,
          revision: tpl.revision,
          active: tpl.active,
          isDemo: true,
          createdBy: userId
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    // 3. Get and seed template parts
    const templateParts = await templates
      .selectFrom("part")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templateParts) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);

      await trx
        .insertInto("part")
        .values({
          id: demoId,
          companyId,
          approved: tpl.approved,
          fromDate: tpl.fromDate,
          toDate: tpl.toDate,
          isDemo: true,
          createdBy: userId
        })
        .onConflict((oc) => oc.columns(["id", "companyId"]).doNothing())
        .execute();
    }
  }

  /**
   * Seed Inventory demo data within a transaction
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async seedInventoryDemoInTransaction(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string
  ): Promise<void> {
    const userId = await this.getCompanyUser(trx, companyId);
    const templates = this.getTemplates(trx);

    // Ensure unitOfMeasure records exist before seeding items
    await this.ensureUnitOfMeasures(trx, companyId, templateSetId);

    // Seed items (inventory is primarily item-based)
    const templateItems = await templates
      .selectFrom("item")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templateItems) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);

      await trx
        .insertInto("item")
        .values({
          id: demoId,
          companyId,
          readableId: tpl.readableId,
          name: tpl.name,
          description: tpl.description,
          type: sql`${tpl.type}::"itemType"`,
          itemTrackingType: sql`${tpl.itemTrackingType}::"itemTrackingType"`,
          replenishmentSystem: sql`${tpl.replenishmentSystem}::"itemReplenishmentSystem"`,
          unitOfMeasureCode: tpl.unitOfMeasureCode,
          revision: tpl.revision,
          active: tpl.active,
          isDemo: true,
          createdBy: userId
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }
  }

  /**
   * Cleanup all demo data for a company within a transaction
   */
  async cleanupAllDemoData(companyId: string): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      // Delete in order respecting foreign key constraints

      // Delete quote line prices first (no isDemo column, linked to quoteLine)
      const demoQuoteLineIds = await trx
        .selectFrom("quoteLine")
        .select("id")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      if (demoQuoteLineIds.length > 0) {
        await trx
          .deleteFrom("quoteLinePrice")
          .where(
            "quoteLineId",
            "in",
            demoQuoteLineIds.map((r) => r.id)
          )
          .execute();
      }

      await trx
        .deleteFrom("quoteLine")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      await trx
        .deleteFrom("purchaseOrderLine")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      await trx
        .deleteFrom("quote")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      await trx
        .deleteFrom("salesRfqLine")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      await trx
        .deleteFrom("salesRfq")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      await trx
        .deleteFrom("opportunity")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      // Delete purchase order related tables
      const demoPOIds = await trx
        .selectFrom("purchaseOrder")
        .select("id")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      if (demoPOIds.length > 0) {
        const poIdList = demoPOIds.map((r) => r.id);

        await trx
          .deleteFrom("purchaseOrderDelivery")
          .where("id", "in", poIdList)
          .execute();

        await trx
          .deleteFrom("purchaseOrderPayment")
          .where("id", "in", poIdList)
          .execute();
      }

      await trx
        .deleteFrom("purchaseOrder")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      // Delete supplier interactions
      await trx
        .deleteFrom("supplierInteraction")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      await trx
        .deleteFrom("part")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      await trx
        .deleteFrom("item")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      await trx
        .deleteFrom("customer")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      await trx
        .deleteFrom("supplier")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      // Clear the seed state
      await trx
        .deleteFrom("demoSeedState")
        .where("companyId", "=", companyId)
        .execute();
    });
  }

  /**
   * Check if demo data exists for a company
   */
  async hasDemoData(companyId: string): Promise<boolean> {
    const result = await this.db
      .selectFrom("demoSeedState")
      .select("companyId")
      .where("companyId", "=", companyId)
      .where("status", "=", "done")
      .limit(1)
      .executeTakeFirst();

    return !!result;
  }

  /**
   * Get demo status for a company
   */
  async getDemoStatus(companyId: string): Promise<
    Array<{
      moduleId: DemoModule;
      status: string;
      seededAt: string | null;
      templateKey: string;
    }>
  > {
    const results = await this.db
      .selectFrom("demoSeedState")
      .innerJoin("templateSet", "templateSet.id", "demoSeedState.templateSetId")
      .select([
        "demoSeedState.moduleId",
        "demoSeedState.status",
        "demoSeedState.seededAt",
        "templateSet.key as templateKey"
      ])
      .where("demoSeedState.companyId", "=", companyId)
      .execute();

    return results as unknown as Array<{
      moduleId: DemoModule;
      status: string;
      seededAt: string | null;
      templateKey: string;
    }>;
  }

  /**
   * Get demo statistics for a company
   */
  async getDemoStatistics(companyId: string): Promise<
    Array<{
      entity: string;
      totalCount: number;
      demoCount: number;
    }>
  > {
    const entities = [
      { name: "items", table: "item" as const },
      { name: "parts", table: "part" as const },
      { name: "quotes", table: "quote" as const },
      { name: "quoteLines", table: "quoteLine" as const },
      { name: "purchaseOrders", table: "purchaseOrder" as const },
      { name: "purchaseOrderLines", table: "purchaseOrderLine" as const },
      { name: "customers", table: "customer" as const },
      { name: "suppliers", table: "supplier" as const }
    ];

    const results: Array<{
      entity: string;
      totalCount: number;
      demoCount: number;
    }> = [];

    for (const { name, table } of entities) {
      // Using type-safe aggregate queries
      const totalResult = await this.db
        .selectFrom(table)
        .select((eb) => eb.fn.countAll().as("count"))
        .where("companyId", "=", companyId)
        .executeTakeFirst();

      const demoResult = await this.db
        .selectFrom(table)
        .select((eb) => eb.fn.countAll().as("count"))
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .executeTakeFirst();

      results.push({
        entity: name,
        totalCount: Number(totalResult?.count ?? 0),
        demoCount: Number(demoResult?.count ?? 0)
      });
    }

    return results;
  }
}

/**
 * Factory function to create a DemoSeeder instance
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDemoSeeder(db: Kysely<any>): DemoSeeder {
  return new DemoSeeder(db);
}

/**
 * Convenience function to seed demo data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seedDemoData(
  db: Kysely<any>,
  options: SeedDemoOptions
): Promise<void> {
  const seeder = createDemoSeeder(db);
  await seeder.seedDemo(options);
}

/**
 * Convenience function to cleanup demo data
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function cleanupDemoData(
  db: Kysely<any>,
  companyId: string
): Promise<void> {
  const seeder = createDemoSeeder(db);
  await seeder.cleanupAllDemoData(companyId);
}
