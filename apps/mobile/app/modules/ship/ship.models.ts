import z from "zod";
import { zfd } from "zod-form-data";

export const shipmentSourceDocumentType = [
  "Sales Order",
  "Purchase Order",
  "Outbound Transfer",
] as const;

export const newShipmentValidator = z.object({
  locationId: z.string(),
  sourceDocument: z.enum(shipmentSourceDocumentType).optional(),
  sourceDocumentId: zfd.text(
    z.string().min(1, { message: "Source Document ID is required" })
  ),
});
