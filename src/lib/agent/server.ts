import { mastra } from "@/mastra";
import { CHAT_AGENT_ID } from "@/lib/agent/config";

export function getChatAgent() {
  return mastra.getAgentById(CHAT_AGENT_ID);
}

export async function getChatAgentMemory() {
  const agent = getChatAgent();
  const memory = await agent.getMemory();

  if (!memory) {
    throw new Error(`Agent "${CHAT_AGENT_ID}" has no memory configured.`);
  }

  return memory;
}
