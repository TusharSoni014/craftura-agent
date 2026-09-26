import { handleChatStream } from "@mastra/ai-sdk";
import { createUIMessageStreamResponse } from "ai";
import { mastra } from "@/mastra";
import {
  CHAT_AGENT_ID,
  CHAT_RESOURCE_ID,
  NEW_THREAD_TITLE,
} from "@/lib/agent/config";
import { getChatAgentMemory } from "@/lib/agent/server";
import { titleFromUserText } from "@/lib/agent/threads";

export const runtime = "nodejs";

function lastUserText(messages: Array<{ parts?: Array<{ type?: string; text?: string }> }>) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    const text = message.parts
      ?.filter((part) => part.type === "text" && part.text)
      .map((part) => part.text)
      .join("\n")
      .trim();
    if (text) {
      return text;
    }
  }
  return "";
}

export async function POST(req: Request) {
  const params = await req.json();
  const threadId =
    typeof params.memory?.thread === "string"
      ? params.memory.thread
      : typeof params.threadId === "string"
        ? params.threadId
        : null;

  if (!threadId) {
    return Response.json({ error: "threadId is required" }, { status: 400 });
  }

  const incomingMessages = Array.isArray(params.messages) ? params.messages : [];
  const latestMessage = incomingMessages.at(-1);
  const memory = await getChatAgentMemory();
  const thread = await memory.getThreadById({ threadId });

  if (thread && (!thread.title || thread.title === NEW_THREAD_TITLE)) {
    const title = titleFromUserText(lastUserText(incomingMessages));
    if (title !== NEW_THREAD_TITLE) {
      await memory.updateThread({
        id: threadId,
        title,
        metadata: thread.metadata,
      });
    }
  }

  const stream = await handleChatStream({
    mastra,
    agentId: CHAT_AGENT_ID,
    version: "v7",
    onError: (error) =>
      error instanceof Error ? error.message : "The weather agent request failed.",
    params: {
      ...params,
      messages: latestMessage ? [latestMessage] : [],
      abortSignal: req.signal,
      memory: {
        thread: threadId,
        resource: CHAT_RESOURCE_ID,
      },
    },
  });

  return createUIMessageStreamResponse({ stream });
}
