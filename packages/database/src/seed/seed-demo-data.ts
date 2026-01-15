import { Kysely, sql, Transaction } from "kysely";
import { v5 as uuidv5 } from "uuid";

/**
 * Demo Template System Types and Utilities
 *
 * This module provides TypeScript types and utilities for working with
 * the demo template system in Carbon.
 */

export const industries = [
  "robotics_oem",
  "cnc_aerospace",
  "metal_fabrication",
  "automotive_precision"
] as const;

export type Industry = (typeof industries)[number];

const demoModules = ["Sales", "Purchasing", "Parts", "Inventory"] as const;

export type DemoModule = (typeof demoModules)[number];

/**
 * Industry display information
 */
export const industryInfo: Record<
  Industry,
  { name: string; description: string }
> = {
  robotics_oem: {
    name: "Robotics OEM",
    description:
      "Original Equipment Manufacturer building robots and automation systems"
  },
  cnc_aerospace: {
    name: "CNC Manufacturing",
    description:
      "CNC machine shop fabricating precision metal and composite parts"
  },
  metal_fabrication: {
    name: "Sheet Metal Fabrication",
    description:
      "Fabrication shop crafting sheet metal components and assemblies"
  },
  automotive_precision: {
    name: "Motor Assembly",
    description:
      "Manufacturer producing precision motor assemblies and components"
  }
};

const DEMO_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

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
  material: {
    templateSetId: string;
    templateRowId: string;
    materialFormName: string;
    materialSubstanceName: string;
    approved: boolean;
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
  workCenter: {
    templateSetId: string;
    templateRowId: string;
    name: string;
    description: string | null;
    machineRate: number;
    overheadRate: number;
    laborRate: number;
    defaultStandardFactor: string;
  };
  process: {
    templateSetId: string;
    templateRowId: string;
    name: string;
    defaultStandardFactor: string;
  };
  workCenterProcess: {
    templateSetId: string;
    tplWorkCenterId: string;
    tplProcessId: string;
  };
  makeMethod: {
    templateSetId: string;
    templateRowId: string;
    tplItemId: string;
  };
  methodMaterial: {
    templateSetId: string;
    templateRowId: string;
    tplMakeMethodId: string;
    tplItemId: string;
    methodType: string;
    tplMaterialMakeMethodId: string | null;
    quantity: number;
    unitOfMeasureCode: string;
  };
  methodOperation: {
    templateSetId: string;
    templateRowId: string;
    tplMakeMethodId: string;
    tplProcessId: string;
    tplWorkCenterId: string | null;
    order: number;
    operationOrder: string;
    description: string | null;
    setupTime: number;
    setupUnit: string;
    laborTime: number;
    laborUnit: string;
    machineTime: number;
    machineUnit: string;
  };
}

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

export function generateDemoId(
  companyId: string,
  templateRowId: string
): string {
  return uuidv5(`${companyId}::${templateRowId}`, DEMO_NAMESPACE);
}

interface SeedDemoOptions {
  companyId: string;
  industryId: Industry;
  moduleIds: DemoModule[];
}

interface SeedModuleOptions {
  companyId: string;
  templateSetId: string;
}

export class DemoSeeder {
  constructor(private db: Kysely<any>) {}

  private get templates() {
    return this.db.withSchema(
      "demo_templates"
    ) as unknown as Kysely<DemoTemplatesSchema>;
  }

  private getTemplates(trx: Transaction<any>) {
    return trx.withSchema(
      "demo_templates"
    ) as unknown as Kysely<DemoTemplatesSchema>;
  }

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

    if (!result) throw new Error(`No users found for company ${companyId}`);
    return result.userId;
  }

  private async ensureUnitOfMeasures(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string
  ): Promise<void> {
    const userId = await this.getCompanyUser(trx, companyId);
    const templates = this.getTemplates(trx);

    const templateItems = await templates
      .selectFrom("item")
      .select("unitOfMeasureCode")
      .distinct()
      .where("templateSetId", "=", templateSetId)
      .where("unitOfMeasureCode", "is not", null)
      .execute();

    if (templateItems.length === 0) return;

    const existing = await trx
      .selectFrom("unitOfMeasure")
      .select("code")
      .where("companyId", "=", companyId)
      .execute();

    const existingCodes = new Set(existing.map((uom) => uom.code));

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

    if (!result)
      throw new Error(
        `No template_set for industry=${industryId}, module=${moduleId}`
      );
    return result.id;
  }

  async seedDemo(options: SeedDemoOptions): Promise<void> {
    const { companyId, industryId, moduleIds } = options;

    for (const moduleId of moduleIds) {
      const templateSetId = await this.getTemplateSetId(industryId, moduleId);
      await this.seedModule({ companyId, templateSetId }, moduleId);
    }
  }

  private async seedModule(
    options: SeedModuleOptions,
    moduleId: DemoModule
  ): Promise<void> {
    const { companyId, templateSetId } = options;

    await this.db.transaction().execute(async (trx) => {
      switch (moduleId) {
        case "Sales":
          await this.seedSalesDemo(trx, companyId, templateSetId);
          break;
        case "Purchasing":
          await this.seedPurchasingDemo(trx, companyId, templateSetId);
          break;
        case "Parts":
          await this.seedPartsDemo(trx, companyId, templateSetId);
          break;
        case "Inventory":
          await this.seedInventoryDemo(trx, companyId, templateSetId);
          break;
        default:
          throw new Error(`No seeder for moduleId=${moduleId}`);
      }
    });
  }

  private async seedItems(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string,
    userId: string
  ) {
    const templates = this.getTemplates(trx);
    const templateItems = await templates
      .selectFrom("item")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    if (templateItems.length === 0) return;

    // Batch insert all items at once
    await trx
      .insertInto("item")
      .values(
        templateItems.map((tpl) => ({
          id: generateDemoId(companyId, tpl.templateRowId),
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
        }))
      )
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();
  }

  private async seedParts(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string,
    userId: string
  ) {
    const templates = this.getTemplates(trx);
    const templateParts = await templates
      .selectFrom("part as p")
      .innerJoin("item as it", (join) =>
        join
          .onRef("it.templateSetId", "=", "p.templateSetId")
          .onRef("it.templateRowId", "=", "p.templateRowId")
      )
      .select([
        "p.templateRowId",
        "p.approved",
        "p.fromDate",
        "p.toDate",
        "it.readableId"
      ])
      .where("p.templateSetId", "=", templateSetId)
      .execute();

    if (templateParts.length === 0) return;

    // Batch insert all parts at once
    await trx
      .insertInto("part")
      .values(
        templateParts.map((tpl) => ({
          id: tpl.readableId,
          companyId,
          approved: tpl.approved,
          fromDate: tpl.fromDate,
          toDate: tpl.toDate,
          isDemo: true,
          createdBy: userId
        }))
      )
      .onConflict((oc) => oc.columns(["id", "companyId"]).doNothing())
      .execute();
  }

  private async seedMaterials(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string,
    userId: string
  ) {
    const templates = this.getTemplates(trx);
    const templateMaterials = await templates
      .selectFrom("material as m")
      .innerJoin("item as it", (join) =>
        join
          .onRef("it.templateSetId", "=", "m.templateSetId")
          .onRef("it.templateRowId", "=", "m.templateRowId")
      )
      .select([
        "m.materialFormName",
        "m.materialSubstanceName",
        "m.approved",
        "it.readableId"
      ])
      .where("m.templateSetId", "=", templateSetId)
      .execute();

    if (templateMaterials.length === 0) return;

    // Fetch all material forms and substances in bulk instead of N+1 queries
    const formNames = [
      ...new Set(templateMaterials.map((m) => m.materialFormName))
    ];
    const substanceNames = [
      ...new Set(templateMaterials.map((m) => m.materialSubstanceName))
    ];

    const [forms, substances] = await Promise.all([
      trx
        .selectFrom("materialForm")
        .select(["id", "name"])
        .where("name", "in", formNames)
        .where("companyId", "is", null)
        .execute(),
      trx
        .selectFrom("materialSubstance")
        .select(["id", "name"])
        .where("name", "in", substanceNames)
        .where("companyId", "is", null)
        .execute()
    ]);

    const formMap = new Map(forms.map((f) => [f.name, f.id]));
    const substanceMap = new Map(substances.map((s) => [s.name, s.id]));

    // Build values for batch insert, skipping invalid materials
    const validMaterials = templateMaterials
      .map((tpl) => {
        const formId = formMap.get(tpl.materialFormName);
        const substanceId = substanceMap.get(tpl.materialSubstanceName);

        if (!formId || !substanceId) {
          console.warn(
            `Skipping material ${tpl.readableId}: form or substance not found`
          );
          return null;
        }

        return {
          id: tpl.readableId,
          companyId,
          materialFormId: formId,
          materialSubstanceId: substanceId,
          approved: tpl.approved,
          isDemo: true,
          createdBy: userId
        };
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);

    if (validMaterials.length > 0) {
      await trx
        .insertInto("material")
        .values(validMaterials)
        .onConflict((oc) => oc.columns(["id", "companyId"]).doNothing())
        .execute();
    }
  }

  private async seedWorkCenters(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string,
    userId: string
  ) {
    const templates = this.getTemplates(trx);
    const templateWorkCenters = await templates
      .selectFrom("workCenter")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    if (templateWorkCenters.length === 0) return;

    await trx
      .insertInto("workCenter")
      .values(
        templateWorkCenters.map((tpl) => ({
          id: generateDemoId(companyId, tpl.templateRowId),
          companyId,
          name: tpl.name,
          description: tpl.description,
          machineRate: tpl.machineRate,
          overheadRate: tpl.overheadRate,
          laborRate: tpl.laborRate,
          defaultStandardFactor: sql`${tpl.defaultStandardFactor}::"factor"`,
          active: true,
          isDemo: true,
          createdBy: userId
        }))
      )
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();
  }

  private async seedProcesses(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string,
    userId: string
  ) {
    const templates = this.getTemplates(trx);
    const templateProcesses = await templates
      .selectFrom("process")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    if (templateProcesses.length === 0) return;

    await trx
      .insertInto("process")
      .values(
        templateProcesses.map((tpl) => ({
          id: generateDemoId(companyId, tpl.templateRowId),
          companyId,
          name: tpl.name,
          defaultStandardFactor: sql`${tpl.defaultStandardFactor}::"factor"`,
          isDemo: true,
          createdBy: userId
        }))
      )
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();
  }

  private async seedWorkCenterProcesses(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string,
    userId: string
  ) {
    const templates = this.getTemplates(trx);
    const templateWCPs = await templates
      .selectFrom("workCenterProcess")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    if (templateWCPs.length === 0) return;

    await trx
      .insertInto("workCenterProcess")
      .values(
        templateWCPs.map((tpl) => ({
          workCenterId: generateDemoId(companyId, tpl.tplWorkCenterId),
          processId: generateDemoId(companyId, tpl.tplProcessId),
          companyId,
          isDemo: true,
          createdBy: userId
        }))
      )
      .onConflict((oc) => oc.columns(["workCenterId", "processId"]).doNothing())
      .execute();
  }

  /**
   * Seeds make methods. Since the trigger is disabled during seeding,
   * we can use straightforward batch inserts with deterministic IDs.
   */
  private async seedMakeMethods(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string,
    userId: string
  ): Promise<Map<string, string>> {
    const templates = this.getTemplates(trx);
    const templateMethods = await templates
      .selectFrom("makeMethod")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    const templateToDbIdMap = new Map<string, string>();

    if (templateMethods.length === 0) return templateToDbIdMap;

    // Build the ID map with deterministic IDs
    for (const tpl of templateMethods) {
      templateToDbIdMap.set(
        tpl.templateRowId,
        generateDemoId(companyId, tpl.templateRowId)
      );
    }

    // Batch insert all make methods at once
    await trx
      .insertInto("makeMethod")
      .values(
        templateMethods.map((tpl) => ({
          id: generateDemoId(companyId, tpl.templateRowId),
          itemId: generateDemoId(companyId, tpl.tplItemId),
          companyId,
          isDemo: true,
          status: sql`'Active'::"makeMethodStatus"`,
          version: 1,
          createdBy: userId
        }))
      )
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();

    return templateToDbIdMap;
  }

  private async seedMethodMaterials(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string,
    userId: string,
    makeMethodIdMap: Map<string, string>
  ) {
    const templates = this.getTemplates(trx);
    const templateMaterials = await templates
      .selectFrom("methodMaterial")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    if (templateMaterials.length === 0) return;

    // Filter to only materials whose makeMethod exists in our mapping
    const validMaterials = templateMaterials.filter((tpl) =>
      makeMethodIdMap.has(tpl.tplMakeMethodId)
    );

    if (validMaterials.length === 0) return;

    await trx
      .insertInto("methodMaterial")
      .values(
        validMaterials.map((tpl) => ({
          id: generateDemoId(companyId, tpl.templateRowId),
          companyId,
          makeMethodId: makeMethodIdMap.get(tpl.tplMakeMethodId)!,
          itemId: generateDemoId(companyId, tpl.tplItemId),
          methodType: sql`${tpl.methodType}::"methodType"`,
          materialMakeMethodId: tpl.tplMaterialMakeMethodId
            ? (makeMethodIdMap.get(tpl.tplMaterialMakeMethodId) ?? null)
            : null,
          quantity: tpl.quantity,
          unitOfMeasureCode: tpl.unitOfMeasureCode,
          isDemo: true,
          createdBy: userId
        }))
      )
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();
  }

  private async seedMethodOperations(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string,
    userId: string,
    makeMethodIdMap: Map<string, string>
  ) {
    const templates = this.getTemplates(trx);
    const templateOps = await templates
      .selectFrom("methodOperation")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    if (templateOps.length === 0) return;

    // Filter to only operations whose makeMethod exists in our mapping
    const validOps = templateOps.filter((tpl) =>
      makeMethodIdMap.has(tpl.tplMakeMethodId)
    );

    if (validOps.length === 0) return;

    await trx
      .insertInto("methodOperation")
      .values(
        validOps.map((tpl) => ({
          id: generateDemoId(companyId, tpl.templateRowId),
          companyId,
          makeMethodId: makeMethodIdMap.get(tpl.tplMakeMethodId)!,
          processId: generateDemoId(companyId, tpl.tplProcessId),
          workCenterId: tpl.tplWorkCenterId
            ? generateDemoId(companyId, tpl.tplWorkCenterId)
            : null,
          order: tpl.order,
          operationOrder: sql`${tpl.operationOrder}::"methodOperationOrder"`,
          description: tpl.description,
          setupTime: tpl.setupTime,
          setupUnit: sql`${tpl.setupUnit}::"factor"`,
          laborTime: tpl.laborTime,
          laborUnit: sql`${tpl.laborUnit}::"factor"`,
          machineTime: tpl.machineTime,
          machineUnit: sql`${tpl.machineUnit}::"factor"`,
          isDemo: true,
          createdBy: userId
        }))
      )
      .onConflict((oc) => oc.column("id").doNothing())
      .execute();
  }

  private async seedSalesDemo(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string
  ): Promise<void> {
    const userId = await this.getCompanyUser(trx, companyId);
    const templates = this.getTemplates(trx);

    // Seed customers
    const templateCustomers = await templates
      .selectFrom("customer")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    if (templateCustomers.length > 0) {
      await trx
        .insertInto("customer")
        .values(
          templateCustomers.map((tpl) => ({
            id: generateDemoId(companyId, tpl.templateRowId),
            companyId,
            name: tpl.name,
            customerTypeId: tpl.customerTypeId,
            customerStatusId: tpl.customerStatusId,
            taxId: tpl.taxId,
            accountManagerId: userId,
            isDemo: true,
            createdBy: userId
          }))
        )
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    await this.ensureUnitOfMeasures(trx, companyId, templateSetId);

    // Disable trigger to prevent auto-creation of makeMethod records
    await sql`ALTER TABLE "item" DISABLE TRIGGER create_make_method_related_records`.execute(
      trx
    );
    try {
      await this.seedItems(trx, companyId, templateSetId, userId);
      await this.seedParts(trx, companyId, templateSetId, userId);
    } finally {
      await sql`ALTER TABLE "item" ENABLE TRIGGER create_make_method_related_records`.execute(
        trx
      );
    }

    // Seed makeMethod records for items so that the quoteLine trigger can find versions
    const templateItems = await templates
      .selectFrom("item")
      .select(["templateRowId"])
      .where("templateSetId", "=", templateSetId)
      .execute();

    if (templateItems.length > 0) {
      await trx
        .insertInto("makeMethod")
        .values(
          templateItems.map((tpl) => ({
            id: generateDemoId(companyId, `mm_${tpl.templateRowId}`),
            itemId: generateDemoId(companyId, tpl.templateRowId),
            companyId,
            isDemo: true,
            status: sql`'Active'::"makeMethodStatus"`,
            version: 1,
            createdBy: userId
          }))
        )
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    // Seed quotes
    const templateQuotes = await templates
      .selectFrom("quote")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templateQuotes) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);
      const oppId = generateDemoId(companyId, `opp_${tpl.templateRowId}`);
      const customerId = generateDemoId(companyId, tpl.tplCustomerId);

      await trx
        .insertInto("opportunity")
        .values({ id: oppId, companyId, customerId, isDemo: true })
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

      await trx
        .insertInto("quoteShipment")
        .values({ id: demoId, companyId, updatedBy: userId })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();

      await trx
        .insertInto("quotePayment")
        .values({
          id: demoId,
          companyId,
          invoiceCustomerId: customerId,
          updatedBy: userId
        })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    // Seed quote lines (trigger will now find makeMethod records)
    const templateQuoteLines = await templates
      .selectFrom("quoteLine as ql")
      .innerJoin("item as it", (join) =>
        join
          .onRef("it.templateSetId", "=", "ql.templateSetId")
          .onRef("it.templateRowId", "=", "ql.tplItemId")
      )
      .select([
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
      .execute();

    for (const tpl of templateQuoteLines) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);
      const quoteId = generateDemoId(companyId, tpl.tplQuoteId);
      const itemId = generateDemoId(companyId, tpl.tplItemId);
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

  private async seedPurchasingDemo(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string
  ): Promise<void> {
    const userId = await this.getCompanyUser(trx, companyId);
    const templates = this.getTemplates(trx);

    // Seed suppliers
    const templateSuppliers = await templates
      .selectFrom("supplier")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    if (templateSuppliers.length > 0) {
      await trx
        .insertInto("supplier")
        .values(
          templateSuppliers.map((tpl) => ({
            id: generateDemoId(companyId, tpl.templateRowId),
            companyId,
            name: tpl.name,
            supplierTypeId: tpl.supplierTypeId,
            supplierStatusId: tpl.supplierStatusId,
            taxId: tpl.taxId,
            accountManagerId: userId,
            isDemo: true,
            createdBy: userId
          }))
        )
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    await this.ensureUnitOfMeasures(trx, companyId, templateSetId);

    // Disable trigger to prevent auto-creation of makeMethod records
    await sql`ALTER TABLE "item" DISABLE TRIGGER create_make_method_related_records`.execute(
      trx
    );
    try {
      await this.seedItems(trx, companyId, templateSetId, userId);
      await this.seedMaterials(trx, companyId, templateSetId, userId);
      await this.seedParts(trx, companyId, templateSetId, userId);
    } finally {
      await sql`ALTER TABLE "item" ENABLE TRIGGER create_make_method_related_records`.execute(
        trx
      );
    }

    // Seed purchase orders
    const templatePOs = await templates
      .selectFrom("purchaseOrder")
      .selectAll()
      .where("templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templatePOs) {
      const demoId = generateDemoId(companyId, tpl.templateRowId);
      const supplierId = generateDemoId(companyId, tpl.tplSupplierId);

      await trx
        .insertInto("supplierInteraction")
        .values({ id: demoId, companyId, supplierId, isDemo: true })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();

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

      await trx
        .insertInto("purchaseOrderPayment")
        .values({ id: demoId, companyId, updatedBy: userId })
        .onConflict((oc) => oc.column("id").doNothing())
        .execute();
    }

    // Seed purchase order lines
    const templatePOLines = await templates
      .selectFrom("purchaseOrderLine as pol")
      .innerJoin("item as it", (join) =>
        join
          .onRef("it.templateSetId", "=", "pol.templateSetId")
          .onRef("it.templateRowId", "=", "pol.tplItemId")
      )
      .select([
        "pol.templateRowId",
        "pol.tplPurchaseOrderId",
        "pol.tplItemId",
        "pol.description",
        "pol.quantity",
        "pol.unitPrice",
        "pol.receiptPromisedDate",
        "it.type as itemType"
      ])
      .where("pol.templateSetId", "=", templateSetId)
      .execute();

    for (const tpl of templatePOLines) {
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
          id: generateDemoId(companyId, tpl.templateRowId),
          companyId,
          purchaseOrderId: generateDemoId(companyId, tpl.tplPurchaseOrderId),
          purchaseOrderLineType: sql`${lineType}::"purchaseOrderLineType"`,
          itemId: generateDemoId(companyId, tpl.tplItemId),
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

  private async seedPartsDemo(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string
  ): Promise<void> {
    const userId = await this.getCompanyUser(trx, companyId);
    await this.ensureUnitOfMeasures(trx, companyId, templateSetId);

    // Disable the trigger that auto-creates makeMethod records.
    // This allows the seeder to have full control with deterministic IDs.
    await sql`ALTER TABLE "item" DISABLE TRIGGER create_make_method_related_records`.execute(
      trx
    );

    try {
      await this.seedItems(trx, companyId, templateSetId, userId);
      await this.seedParts(trx, companyId, templateSetId, userId);
      await this.seedMaterials(trx, companyId, templateSetId, userId);
      // Seed manufacturing data (work centers, processes, BOMs)
      await this.seedWorkCenters(trx, companyId, templateSetId, userId);
      await this.seedProcesses(trx, companyId, templateSetId, userId);
      await this.seedWorkCenterProcesses(trx, companyId, templateSetId, userId);
      const makeMethodIdMap = await this.seedMakeMethods(
        trx,
        companyId,
        templateSetId,
        userId
      );
      await this.seedMethodMaterials(
        trx,
        companyId,
        templateSetId,
        userId,
        makeMethodIdMap
      );
      await this.seedMethodOperations(
        trx,
        companyId,
        templateSetId,
        userId,
        makeMethodIdMap
      );
    } finally {
      // Re-enable the trigger for normal operation
      await sql`ALTER TABLE "item" ENABLE TRIGGER create_make_method_related_records`.execute(
        trx
      );
    }
  }

  private async seedInventoryDemo(
    trx: Transaction<any>,
    companyId: string,
    templateSetId: string
  ): Promise<void> {
    const userId = await this.getCompanyUser(trx, companyId);
    await this.ensureUnitOfMeasures(trx, companyId, templateSetId);

    // Disable trigger to prevent auto-creation of makeMethod records
    await sql`ALTER TABLE "item" DISABLE TRIGGER create_make_method_related_records`.execute(
      trx
    );
    try {
      await this.seedItems(trx, companyId, templateSetId, userId);
      await this.seedParts(trx, companyId, templateSetId, userId);
      await this.seedMaterials(trx, companyId, templateSetId, userId);
    } finally {
      await sql`ALTER TABLE "item" ENABLE TRIGGER create_make_method_related_records`.execute(
        trx
      );
    }
  }

  async cleanupAllDemoData(companyId: string): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
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

      const demoQuoteIds = await trx
        .selectFrom("quote")
        .select("id")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      if (demoQuoteIds.length > 0) {
        const quoteIdList = demoQuoteIds.map((r) => r.id);
        await trx
          .deleteFrom("quoteShipment")
          .where("id", "in", quoteIdList)
          .execute();
        await trx
          .deleteFrom("quotePayment")
          .where("id", "in", quoteIdList)
          .execute();
      }

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
      await trx
        .deleteFrom("supplierInteraction")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      // Delete manufacturing BOM data (order matters due to FK constraints)
      await trx
        .deleteFrom("methodOperation")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();
      await trx
        .deleteFrom("methodMaterial")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();
      await trx
        .deleteFrom("makeMethod")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      // Delete work center and process data
      await trx
        .deleteFrom("workCenterProcess")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();
      await trx
        .deleteFrom("process")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();
      await trx
        .deleteFrom("workCenter")
        .where("companyId", "=", companyId)
        .where("isDemo", "=", true)
        .execute();

      await trx
        .deleteFrom("material")
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
    });
  }

  async hasDemoData(companyId: string): Promise<boolean> {
    const result = await this.db
      .selectFrom("item")
      .select("id")
      .where("companyId", "=", companyId)
      .where("isDemo", "=", true)
      .limit(1)
      .executeTakeFirst();

    return !!result;
  }

  async getDemoStatistics(
    companyId: string
  ): Promise<Array<{ entity: string; totalCount: number; demoCount: number }>> {
    const entities = [
      { name: "items", table: "item" as const },
      { name: "parts", table: "part" as const },
      { name: "quotes", table: "quote" as const },
      { name: "quoteLines", table: "quoteLine" as const },
      { name: "purchaseOrders", table: "purchaseOrder" as const },
      { name: "purchaseOrderLines", table: "purchaseOrderLine" as const },
      { name: "customers", table: "customer" as const },
      { name: "suppliers", table: "supplier" as const },
      { name: "workCenters", table: "workCenter" as const },
      { name: "processes", table: "process" as const },
      { name: "makeMethods", table: "makeMethod" as const },
      { name: "methodMaterials", table: "methodMaterial" as const },
      { name: "methodOperations", table: "methodOperation" as const }
    ];

    const results: Array<{
      entity: string;
      totalCount: number;
      demoCount: number;
    }> = [];

    for (const { name, table } of entities) {
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

export function createDemoSeeder(db: Kysely<any>): DemoSeeder {
  return new DemoSeeder(db);
}

export async function seedDemoData(
  db: Kysely<any>,
  options: SeedDemoOptions
): Promise<void> {
  const seeder = createDemoSeeder(db);
  await seeder.seedDemo(options);
}

export async function cleanupDemoData(
  db: Kysely<any>,
  companyId: string
): Promise<void> {
  const seeder = createDemoSeeder(db);
  await seeder.cleanupAllDemoData(companyId);
}
