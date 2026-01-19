import { Kysely, sql } from "kysely";
import { z } from "zod";
import { KyselyDatabase } from "./client.ts";

export const OperationSchema = z.enum([
  "INSERT",
  "UPDATE",
  "DELETE",
  "TRUNCATE"
]);

const HandlerTypeSchema = z.enum(["WEBHOOK", "WORKFLOW", "SYNC"]);

export const EventSchema = z.object({
  table: z.string(),
  operation: z.enum(["INSERT", "UPDATE", "DELETE", "TRUNCATE"]),
  recordId: z.string(),
  data: z.record(z.any()),
  oldData: z.record(z.any()).nullable(),
  timestamp: z.string()
});

export const QueueMessageSchema = z.object({
  subscriptionId: z.string(),
  triggerType: z.enum(["ROW", "STATEMENT"]),
  handlerType: HandlerTypeSchema,
  handlerConfig: z.record(z.any()),
  event: EventSchema
});

export type EventSystemEvent = z.infer<typeof EventSchema>;
export type HandlerType = z.infer<typeof HandlerTypeSchema>;
export type QueueMessage = z.infer<typeof QueueMessageSchema>;

// The Main Subscription Schema
export const CreateSubscriptionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // The table name in your database
  table: z.string().min(1, "Table name is required"),
  companyId: z.string().min(1, "Company ID is required"),
  // Must provide at least one operation (e.g. ['INSERT'])
  operations: z
    .array(OperationSchema)
    .min(1, "At least one operation is required"),
  // The type determines how Trigger.dev processes it
  type: HandlerTypeSchema,
  // Configuration specific to the handler (URL for webhooks, WorkflowID for workflows)
  // We allow any object here since it's stored as JSONB
  config: z.record(z.any()).default({}),
  // Database-level filtering (e.g. { status: "paid" })
  filter: z.record(z.any()).default({}),
  // Optimization: specific batch size for PGMQ
  batchSize: z.number().int().positive().default(50),
  // Defaults to true
  active: z.boolean().default(true)
});

export type CreateSubscriptionParams = z.infer<typeof CreateSubscriptionSchema>;

export async function createEventSystemSubscription(
  client: Kysely<KyselyDatabase>,
  input: CreateSubscriptionParams
) {
  // 1. Runtime Validation
  // This throws a clear ZodError if inputs are wrong (e.g. missing 'table' or invalid 'type')
  const params = CreateSubscriptionSchema.parse(input);

  // 2. Database Insert
  // Note: We cast arrays/objects to ensure Postgres driver handles them correctly
  const result = await sql`
    INSERT INTO "eventSystemSubscription" (
      "name", 
      "table", 
      "companyId",
      "operations", 
      "filter", 
      "type", 
      "config", 
      "batchSize",
      "active"
    )
    VALUES (
      ${params.name}, 
      ${params.table}, 
      ${params.companyId},
      ${params.operations},
      ${params.filter}, 
      ${params.type}, 
      ${params.config}, 
      ${params.batchSize},
      ${params.active}
    )
    RETURNING "id"
  `.execute(client);

  return result[0];
}

export async function deleteEventSystemSubscription(
  client: Kysely<KyselyDatabase>,
  subscriptionId: string
) {
  await sql`
    DELETE FROM "eventSystemSubscription"
    WHERE "id" = ${subscriptionId}
  `.execute(client);
}
