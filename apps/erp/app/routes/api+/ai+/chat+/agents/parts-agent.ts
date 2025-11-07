import { openai } from "@ai-sdk/openai";
import type { Agent } from "@ai-sdk-tools/agents";
import { getPartTool } from "../tools/part-tools";
import { createAgent } from "./shared/agent";
import type { ChatContext } from "./shared/context";
import { COMMON_AGENT_RULES, formatContextForLLM } from "./shared/prompts";

export const partsAgent: Agent<ChatContext> = createAgent({
  name: "parts",
  model: openai("gpt-4o-mini"),
  temperature: 0.3,
  instructions: (ctx) => `You are a parts specialist for ${
    ctx.companyName
  }. Search for parts by description or readable ID.

Key capabilities:
- Look up parts by readable ID or description
- Provide part details including ID, name, and description
- Help identify the correct part when multiple matches exist

When handling part requests:
1. Use the getPart tool to search by readable ID or description
2. If multiple parts are found, present options to the user
3. If no parts are found, inform the user and ask for clarification
4. If a supplier is needed for a part, hand off to supplierAgent
5. If a purchase order needs to be created, hand off to purchasingAgent

<background-data>
${formatContextForLLM(ctx)}
</background-data>

${COMMON_AGENT_RULES}

<guidelines>
- For direct queries: lead with results, add context
- Always confirm the correct part when multiple matches exist
</guidelines>`,
  tools: {
    getPart: getPartTool,
  },
  handoffs: [],
  maxTurns: 10,
});

// Configure handoffs after all agents are defined
export function configurePartsAgentHandoffs(
  supplierAgent: Agent<ChatContext>,
  purchasingAgent: Agent<ChatContext>
) {
  (partsAgent as any).handoffs = [supplierAgent, purchasingAgent];
}
