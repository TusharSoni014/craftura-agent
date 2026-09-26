"use client";

import type { DynamicToolUIPart, ToolUIPart, UIMessage } from "ai";
import { CloudSunIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";

type ChatToolPart = ToolUIPart | DynamicToolUIPart;

function isToolPart(part: UIMessage["parts"][number]): part is ChatToolPart {
  return part.type === "dynamic-tool" || part.type.startsWith("tool-");
}

function toolName(part: ChatToolPart) {
  if (part.type === "dynamic-tool") {
    return part.toolName;
  }
  return part.type.replace(/^tool-/, "");
}

function toolLabel(part: ChatToolPart) {
  const name = toolName(part);
  if (part.state === "output-available" && part.output && typeof part.output === "object") {
    const output = part.output as Record<string, unknown>;
    if (
      typeof output.location === "string" &&
      typeof output.temperature === "number" &&
      typeof output.conditions === "string"
    ) {
      return `${output.location}: ${output.temperature}°, ${output.conditions}`;
    }
    return `${name} finished`;
  }
  if (part.state === "output-error") {
    return part.errorText || `${name} failed`;
  }
  return `Using ${name}…`;
}

export function AgentMessage({
  agentName,
  message,
}: {
  agentName: string;
  message: UIMessage;
}) {
  const align = message.role === "user" ? "end" : "start";
  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
  const tools = message.parts.filter(isToolPart);
  const isStreamingText = message.parts.some(
    (part) => part.type === "text" && part.state === "streaming",
  );

  return (
    <Message align={align}>
      {message.role !== "user" ? (
        <MessageAvatar>
          <Avatar size="sm">
            <AvatarImage alt={agentName} src="/api/agent/avatar" />
            <AvatarFallback>WA</AvatarFallback>
          </Avatar>
        </MessageAvatar>
      ) : null}
      <MessageContent>
        <MessageHeader>
          {message.role === "user" ? "You" : agentName}
        </MessageHeader>
        {tools.map((part) => (
          <Marker key={`${message.id}-${part.toolCallId}`}>
            <MarkerIcon>
              <CloudSunIcon />
            </MarkerIcon>
            <MarkerContent>{toolLabel(part)}</MarkerContent>
            {part.state === "output-available" ? (
              <Badge variant="secondary">Live weather</Badge>
            ) : null}
          </Marker>
        ))}
        {text ? (
          <Bubble align={align} variant={message.role === "user" ? "default" : "muted"}>
            <BubbleContent className="whitespace-pre-wrap">
              {text}
              {isStreamingText ? <span className="shimmer">▍</span> : null}
            </BubbleContent>
          </Bubble>
        ) : null}
      </MessageContent>
    </Message>
  );
}
