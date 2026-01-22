import { BillSyncer } from "../providers/xero/entities/bill";
import { ContactSyncer } from "../providers/xero/entities/contact";
import { EmployeeSyncer } from "../providers/xero/entities/employee";
import { SalesInvoiceSyncer } from "../providers/xero/entities/invoice";
import { ItemSyncer } from "../providers/xero/entities/item";
import { PurchaseOrderSyncer } from "../providers/xero/entities/purchase-order";
import type { AccountingEntityType, IEntitySyncer, SyncContext } from "./types";

export const SyncFactory = {
  /**
   * Instantiates the correct Syncer class based on the Entity Type.
   * @param type - The entity type string (e.g., 'customer', 'invoice')
   * @param context - The execution context (DB connection, Provider, Config)
   */
  getSyncer(type: AccountingEntityType, context: SyncContext): IEntitySyncer {
    switch (type) {
      // Master Data
      case "vendor":
      case "customer":
        return new ContactSyncer(context);
      case "item":
        return new ItemSyncer(context);
      case "employee":
        return new EmployeeSyncer(context);

      // Transaction Data
      case "bill":
        return new BillSyncer(context);
      case "invoice":
        return new SalesInvoiceSyncer(context);
      case "purchaseOrder":
        return new PurchaseOrderSyncer(context);

      // Not yet implemented
      // case "payment":
      //   return new PaymentSyncer(context);
      // case "salesOrder":
      //   return new SalesOrderSyncer(context);
      // case "inventoryAdjustment":
      //   return new InventoryAdjustmentSyncer(context);

      default:
        throw new Error(
          `No Syncer implementation found for entity type: ${type}`
        );
    }
  }
};
