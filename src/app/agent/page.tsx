import { AgentShell } from "@/components/agent/agent-shell";

export const metadata = {
  title: "Agent",
  description: "Chat with the registered Mastra agent",
};

export default async function AgentPage({
  searchParams,
}: PageProps<"/agent">) {
  const params = await searchParams;
  const thread = typeof params.thread === "string" ? params.thread : undefined;

  return <AgentShell threadId={thread} />;
}
