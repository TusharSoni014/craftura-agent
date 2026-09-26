import { NextResponse } from "next/server";
import { CHAT_RESOURCE_ID, NEW_THREAD_TITLE } from "@/lib/agent/config";
import { getChatAgentMemory } from "@/lib/agent/server";
import { serializeThread } from "@/lib/agent/threads";

export const runtime = "nodejs";

export async function GET() {
  try {
    const memory = await getChatAgentMemory();
    const result = await memory.listThreads({
      filter: { resourceId: CHAT_RESOURCE_ID },
      perPage: false,
      orderBy: { field: "updatedAt", direction: "DESC" },
    });

    return NextResponse.json(result.threads.map(serializeThread));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load conversations.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const memory = await getChatAgentMemory();
    const thread = await memory.createThread({
      resourceId: CHAT_RESOURCE_ID,
      title: NEW_THREAD_TITLE,
    });

    return NextResponse.json(serializeThread(thread));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create a thread.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
