"use client";

import { CloudSunIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AgentConversation } from "@/components/agent/agent-conversation";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type { AgentThread } from "@/lib/agent/threads";

export function AgentShell({ threadId }: { threadId?: string }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [agentName, setAgentName] = useState("Agent");
  const [threads, setThreads] = useState<AgentThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refreshThreads = useCallback(async () => {
    try {
      const response = await fetch("/api/agent/threads");
      if (!response.ok) {
        setThreads([]);
        return;
      }
      const data = (await response.json()) as AgentThread[];
      setThreads(Array.isArray(data) ? data : []);
    } catch {
      setThreads([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/agent/info")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load agent");
        }
        return response.json() as Promise<{ name: string }>;
      })
      .then((info) => {
        if (!cancelled) {
          setAgentName(info.name);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setThreadsLoading(true);
    refreshThreads()
      .catch(() => {
        if (!cancelled) {
          setThreads([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setThreadsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [refreshThreads]);

  async function startConversation() {
    setCreating(true);
    try {
      const response = await fetch("/api/agent/threads", { method: "POST" });
      if (!response.ok) {
        throw new Error("Could not create a thread");
      }
      const thread = (await response.json()) as AgentThread;
      await refreshThreads();
      router.push(`/agent?thread=${thread.id}`);
    } finally {
      setCreating(false);
    }
  }

  if (!mounted) {
    return (
      <div className="flex h-svh items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <AgentSidebar
        activeThreadId={threadId}
        onThreadsChange={refreshThreads}
        threads={threads}
        threadsLoading={threadsLoading}
      />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" />
          <p className="truncate text-sm font-medium">{agentName}</p>
        </header>
        {threadId ? (
          <AgentConversation
            agentName={agentName}
            onThreadUpdated={refreshThreads}
            threadId={threadId}
          />
        ) : (
          <Empty className="flex-1">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CloudSunIcon />
              </EmptyMedia>
              <EmptyTitle>Start a conversation</EmptyTitle>
              <EmptyDescription>
                Open a thread from the sidebar or create a new chat to talk to{" "}
                {agentName}.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button disabled={creating} onClick={() => void startConversation()}>
                New chat
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
