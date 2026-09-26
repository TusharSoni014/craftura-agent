"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CloudSunIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { AgentThread } from "@/lib/agent/threads";

type AgentInfo = {
  id: string;
  name: string;
};

export function AgentSidebar({
  activeThreadId,
  threads,
  threadsLoading,
  onThreadsChange,
}: {
  activeThreadId?: string;
  threads: AgentThread[];
  threadsLoading: boolean;
  onThreadsChange: () => Promise<void>;
}) {
  const router = useRouter();
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/agent/info")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load agent");
        }
        return response.json() as Promise<AgentInfo>;
      })
      .then((info) => {
        if (!cancelled) {
          setAgent(info);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAgent(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const createThread = useCallback(async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/agent/threads", { method: "POST" });
      if (!response.ok) {
        throw new Error("Could not create a thread");
      }
      const thread = (await response.json()) as AgentThread;
      await onThreadsChange();
      router.push(`/agent?thread=${thread.id}`);
    } finally {
      setCreating(false);
    }
  }, [onThreadsChange, router]);

  const deleteThread = useCallback(
    async (threadId: string) => {
      const response = await fetch(`/api/agent/threads/${threadId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Could not delete thread");
      }
      await onThreadsChange();
      if (activeThreadId === threadId) {
        router.push("/agent");
      }
    },
    [activeThreadId, onThreadsChange, router],
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={agent?.name ?? "Agent"}>
              <Avatar size="sm">
                <AvatarImage src="/api/agent/avatar" alt={agent?.name ?? "Agent"} />
                <AvatarFallback>WA</AvatarFallback>
              </Avatar>
              <span className="truncate font-medium">
                {agent?.name ?? "Loading agent…"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Button
          className="w-full group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0"
          disabled={creating}
          onClick={createThread}
          size="sm"
        >
          {creating ? null : <PlusIcon data-icon="inline-start" />}
          <span className="group-data-[collapsible=icon]:sr-only">New chat</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {threadsLoading ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled tooltip="Loading conversations">
                    <CloudSunIcon />
                    <span>Loading conversations…</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : threads.length === 0 ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled tooltip="No conversations yet">
                    <CloudSunIcon />
                    <span>No conversations yet</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                threads.map((thread) => (
                  <SidebarMenuItem key={thread.id}>
                    <SidebarMenuButton
                      isActive={thread.id === activeThreadId}
                      onClick={() => {
                        router.push(`/agent?thread=${thread.id}`);
                      }}
                      tooltip={thread.title}
                    >
                      <CloudSunIcon />
                      <span>{thread.title}</span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<SidebarMenuAction showOnHover />}
                      >
                        <MoreHorizontalIcon />
                        <span className="sr-only">Thread actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" side="right">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onClick={() => {
                              void deleteThread(thread.id);
                            }}
                            variant="destructive"
                          >
                            <Trash2Icon />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                router.push("/");
              }}
              tooltip="Home"
            >
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
