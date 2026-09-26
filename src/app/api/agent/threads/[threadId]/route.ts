import { NextResponse } from "next/server";
import { getChatAgentMemory } from "@/lib/agent/server";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params;
  const memory = await getChatAgentMemory();
  await memory.deleteThread(threadId);
  return NextResponse.json({ ok: true });
}
