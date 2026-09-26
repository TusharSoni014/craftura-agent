import { NextResponse } from "next/server";
import { toAISdkMessages } from "@mastra/ai-sdk/ui";
import { CHAT_RESOURCE_ID } from "@/lib/agent/config";
import { getChatAgentMemory } from "@/lib/agent/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const threadId = new URL(req.url).searchParams.get("threadId");

  if (!threadId) {
    return NextResponse.json({ error: "threadId is required" }, { status: 400 });
  }

  const memory = await getChatAgentMemory();

  try {
    const recalled = await memory.recall({
      threadId,
      resourceId: CHAT_RESOURCE_ID,
      perPage: false,
    });
    return NextResponse.json(
      toAISdkMessages(recalled.messages, { version: "v7" }),
    );
  } catch {
    return NextResponse.json([]);
  }
}
