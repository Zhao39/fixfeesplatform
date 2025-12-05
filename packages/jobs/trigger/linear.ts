import { getCarbonServiceRole } from "@carbon/auth";
import {
  getCompanyEmployees,
  LinearClient,
  LinearIssueSchema,
  linkActionToLinearIssue,
} from "@carbon/ee/linear";
import { task } from "@trigger.dev/sdk";
import { z } from "zod/v3";

const linear = new LinearClient();

export const linearEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Issue"),
    action: z.literal("update"),
    data: LinearIssueSchema.omit({
      assignee: true,
    }).extend({
      assigneeId: z.string().optional(),
    }),
  }),
]);

const linearSchema = z.object({
  companyId: z.string(),
  event: linearEventSchema,
});

export const linearTask = task({
  id: "linear",
  retry: {
    maxAttempts: 1,
  },
  maxDuration: 5 * 60,
  run: async (payload: z.infer<typeof linearSchema>) => {
    let result: { success: boolean; message: string };

    console.info(`🔰 Linear webhook received: ${payload}`);
    console.info(`📦 Payload:`, payload);

    const carbon = getCarbonServiceRole();

    const [company, integration] = await Promise.all([
      carbon.from("company").select("*").eq("id", payload.companyId).single(),
      carbon
        .from("companyIntegration")
        .select("*")
        .eq("companyId", payload.companyId)
        .eq("id", "linear")
        .single(),
    ]);

    if (company.error || !company.data) {
      throw new Error("Failed to fetch company from Carbon");
    }

    if (integration.error || !integration.data) {
      throw new Error("Failed to fetch integration from Carbon");
    }

    const action = await carbon
      .from("nonConformanceActionTask")
      .select("id")
      .eq("externalId->>linear.id", payload.event.data.id)
      .eq("companyId", payload.companyId)
      .maybeSingle();

    if (!action.data)
      return {
        success: false,
        message: `No linked action found for Linear issue ID ${payload.event.data.id} in company ${company.data.name}`,
      };

    let assignee = null;

    if (payload.event.data.assigneeId) {
      const linearUser = await linear.getUserById(
        payload.companyId,
        payload.event.data.assigneeId
      );
      const employees = await getCompanyEmployees(carbon, payload.companyId, [
        linearUser?.email,
      ]);
      assignee = employees.length > 0 ? employees[0].userId : null;
    }

    await linkActionToLinearIssue(carbon, payload.companyId, {
      actionId: action.data.id,
      issue: payload.event.data,
      assignee,
    });

    result = {
      success: true,
      message: `Processed ${payload.event.type} event for company ${company.data.name}`,
    };

    if (result.success) {
      console.info(`✅ Successfully processed ${payload.event.type} event`);
    } else {
      console.error(
        `❌ Failed to process ${payload.event.type} event: ${result.message}`
      );
    }

    return result;
  },
});
