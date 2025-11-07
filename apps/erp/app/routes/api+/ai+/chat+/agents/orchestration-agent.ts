import { openai } from "@ai-sdk/openai";
import {
  partsAgent,
  configurePartsAgentHandoffs,
} from "./parts-agent";
import { purchasingAgent } from "./purchasing-agent";
import { searchAgent } from "./search-agent";
import { createAgent } from "./shared/agent";
import { formatContextForLLM } from "./shared/prompts";
import {
  supplierAgent,
  configureSupplierAgentHandoffs,
} from "./supplier-agent";

// Configure handoffs between agents after they're all defined
configurePartsAgentHandoffs(supplierAgent, purchasingAgent);
configureSupplierAgentHandoffs(partsAgent, purchasingAgent);

export const orchestrationAgent = createAgent({
  name: "triage",
  model: openai("gpt-4o-mini"),
  temperature: 0.1,
  modelSettings: {
    toolChoice: {
      type: "tool",
      toolName: "handoff_to_agent",
    },
  },
  instructions: (ctx) => `Route user requests to the appropriate specialist.

<background-data>
${formatContextForLLM(ctx)}

<agent-capabilities>
general: General questions, greetings, web search
parts: Search for parts by description or readable ID
suppliers: Search for suppliers, find suppliers for parts
purchasing: creating purchase orders or getting quotes from suppliers
</agent-capabilities>
</background-data>`,
  handoffs: [purchasingAgent, searchAgent, partsAgent, supplierAgent],
  maxTurns: 1,
});
