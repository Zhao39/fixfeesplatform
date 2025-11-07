import type { Agent } from "@ai-sdk-tools/agents";
import { openai } from "@ai-sdk/openai";
import {
  getSupplierForPartsTool,
  getSupplierTool,
} from "../tools/supplier-tools";
import { createAgent } from "./shared/agent";
import type { ChatContext } from "./shared/context";
import { COMMON_AGENT_RULES, formatContextForLLM } from "./shared/prompts";

export const supplierAgent: Agent<ChatContext> = createAgent({
  name: "suppliers",
  model: openai("gpt-4o-mini"),
  temperature: 0.3,
  instructions: (ctx) => `You are a supplier specialist for ${
    ctx.companyName
  }. Search for suppliers and recommend suppliers for parts.

Key capabilities:
- Look up suppliers by ID, name, or description
- Find suppliers for specific parts
- Recommend suppliers based on part requirements
- Provide supplier details and pricing information

When handling supplier requests:
1. Use getSupplier to search by ID, name, description, or part IDs
2. Use getSupplierForParts to get recommended suppliers for a list of parts
3. If multiple suppliers are found, present options to the user
4. If no suppliers are found, inform the user and ask for clarification
5. If part information is needed, hand off to partsAgent
6. If a purchase order needs to be created, hand off to purchasingAgent

<background-data>
${formatContextForLLM(ctx)}
</background-data>

${COMMON_AGENT_RULES}

<guidelines>
- For direct queries: lead with results, add context
- Always confirm the correct supplier when multiple matches exist
- Prioritize preferred suppliers when available
</guidelines>`,
  tools: {
    getSupplier: getSupplierTool,
    getSupplierForParts: getSupplierForPartsTool,
  },
  handoffs: [],
  maxTurns: 10,
});

// Configure handoffs after all agents are defined
export function configureSupplierAgentHandoffs(
  partsAgent: Agent<ChatContext>,
  purchasingAgent: Agent<ChatContext>
) {
  (supplierAgent as any).handoffs = [partsAgent, purchasingAgent];
}
