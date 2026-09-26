"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { CloudSunIcon, SendHorizontalIcon } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AgentMessage } from "@/components/agent/agent-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  MessageGroup,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { CHAT_RESOURCE_ID } from "@/lib/agent/config";

function groupMessages(messages: UIMessage[]) {
  const groups: UIMessage[][] = [];
  for (const message of messages) {
    const lastGroup = groups.at(-1);
    if (lastGroup && lastGroup[0]?.role === message.role) {
      lastGroup.push(message);
    } else {
      groups.push([message]);
    }
  }
  return groups;
}

export function AgentConversation({
  agentName,
  onThreadUpdated,
  threadId,
}: {
  agentName: string;
  onThreadUpdated: () => Promise<void>;
  threadId: string;
}) {
  const [input, setInput] = useState("");
  const [historyError, setHistoryError] = useState<string | null>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/agent/chat",
        prepareSendMessagesRequest({ messages }) {
          return {
            body: {
              messages: messages.slice(-1),
              threadId,
              memory: {
                thread: threadId,
                resource: CHAT_RESOURCE_ID,
              },
            },
          };
        },
      }),
    [threadId],
  );

  const { error, messages, sendMessage, setMessages, status, stop } = useChat({
    id: threadId,
    transport,
    onFinish: () => {
      void onThreadUpdated().catch(() => undefined);
    },
  });

  useEffect(() => {
    let cancelled = false;
    setHistoryError(null);
    fetch(`/api/agent/messages?threadId=${encodeURIComponent(threadId)}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not load this conversation.");
        }
        return response.json() as Promise<UIMessage[]>;
      })
      .then((history) => {
        if (!cancelled) {
          setMessages(history);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setHistoryError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load this conversation.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [setMessages, threadId]);

  const isBusy = status === "submitted" || status === "streaming";
  const groups = groupMessages(messages);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) {
      return;
    }
    setInput("");
    await sendMessage({ text });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageScrollerProvider autoScroll>
        <MessageScroller>
          <MessageScrollerViewport>
            <MessageScrollerContent className="mx-auto w-full max-w-3xl px-4 py-6">
              {historyError ? (
                <Alert variant="destructive">
                  <AlertTitle>Conversation history</AlertTitle>
                  <AlertDescription>{historyError}</AlertDescription>
                </Alert>
              ) : null}
              {messages.length === 0 && !isBusy ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <CloudSunIcon />
                    </EmptyMedia>
                    <EmptyTitle>Ask {agentName}</EmptyTitle>
                    <EmptyDescription>
                      This page streams the registered Mastra weather agent. Ask
                      for a real forecast by city.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button
                      onClick={() => {
                        void sendMessage({
                          text: "What is the weather in Tokyo right now?",
                        });
                      }}
                      variant="outline"
                    >
                      Weather in Tokyo
                    </Button>
                  </EmptyContent>
                </Empty>
              ) : null}
              {groups.map((group) => (
                <MessageGroup key={group[0]?.id}>
                  {group.map((message) => (
                    <MessageScrollerItem
                      key={message.id}
                      messageId={message.id}
                      scrollAnchor={message.role === "user"}
                    >
                      <AgentMessage agentName={agentName} message={message} />
                    </MessageScrollerItem>
                  ))}
                </MessageGroup>
              ))}
              {status === "submitted" ? (
                <MessageScrollerItem messageId="thinking">
                  <p className="shimmer px-3 text-sm text-muted-foreground">
                    Thinking…
                  </p>
                </MessageScrollerItem>
              ) : null}
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>Agent error</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              ) : null}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
      <form
        className="mx-auto w-full max-w-3xl px-4 pb-4"
        onSubmit={handleSubmit}
      >
        <FieldGroup>
          <Field>
            <FieldLabel className="sr-only" htmlFor="agent-message">
              Message
            </FieldLabel>
            <InputGroup className="h-auto">
              <InputGroupTextarea
                disabled={isBusy}
                id="agent-message"
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder={`Message ${agentName}…`}
                rows={3}
                value={input}
              />
              <InputGroupAddon align="block-end">
                {isBusy ? (
                  <InputGroupButton
                    onClick={() => {
                      stop();
                    }}
                    type="button"
                    variant="outline"
                  >
                    Stop
                  </InputGroupButton>
                ) : (
                  <InputGroupButton
                    disabled={!input.trim()}
                    size="sm"
                    type="submit"
                    variant="default"
                  >
                    <SendHorizontalIcon data-icon="inline-start" />
                    Send
                  </InputGroupButton>
                )}
              </InputGroupAddon>
            </InputGroup>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
