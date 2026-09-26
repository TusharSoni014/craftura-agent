export type AgentThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export function serializeThread(thread: {
  id: string;
  title?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}): AgentThread {
  return {
    id: thread.id,
    title: thread.title?.trim() || "New chat",
    createdAt:
      thread.createdAt instanceof Date
        ? thread.createdAt.toISOString()
        : thread.createdAt,
    updatedAt:
      thread.updatedAt instanceof Date
        ? thread.updatedAt.toISOString()
        : thread.updatedAt,
  };
}

export function titleFromUserText(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return "New chat";
  }
  return cleaned.length > 48 ? `${cleaned.slice(0, 45)}…` : cleaned;
}
