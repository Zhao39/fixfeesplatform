import { openai } from "npm:@ai-sdk/openai@2.0.60";
import {
  createPurchaseOrderTool,
  getPartTool,
  getSupplierForPartsTool,
  getSupplierTool,
} from "../tools/purchasing.ts";
import { createAgent } from "./shared/agent.ts";
import {
  COMMON_AGENT_RULES,
  formatContextForLLM,
} from "./shared/prompts.ts";

export const purchasingAgent = createAgent({
  name: "purchasing",
  model: openai("gpt-4o-mini"),
  temperature: 0.3,
  instructions: (
    ctx,
  ) => `You are a purchasing specialist for ${ctx.companyName}. Create purchase orders or get quotes from suppliers.

<background-data>
${formatContextForLLM(ctx)}
</background-data>

${COMMON_AGENT_RULES}

<guidelines>
- For direct queries: lead with results, add context
</guidelines>`,
  tools: {
    // @ts-expect-error - version mismatch between ai@5.0.86 and @ai-sdk-tools/agents@1.0.0
    getPart: getPartTool,
    // @ts-expect-error - version mismatch between ai@5.0.86 and @ai-sdk-tools/agents@1.0.0
    getSupplier: getSupplierTool,
    // @ts-expect-error - version mismatch between ai@5.0.86 and @ai-sdk-tools/agents@1.0.0
    getSupplierForParts: getSupplierForPartsTool,
    // @ts-expect-error - version mismatch between ai@5.0.86 and @ai-sdk-tools/agents@1.0.0
    createPurchaseOrder: createPurchaseOrderTool,
  },
  maxTurns: 10,
});
