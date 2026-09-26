import { NextResponse } from "next/server";
import { getChatAgent } from "@/lib/agent/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const agent = getChatAgent();
    return NextResponse.json({
      id: agent.id,
      name: agent.name,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load the agent.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
