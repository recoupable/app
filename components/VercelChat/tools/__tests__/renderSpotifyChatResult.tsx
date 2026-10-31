import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, vi } from "vitest";
import type { UIMessage } from "ai";
import { MessageParts } from "@/components/VercelChat/MessageParts";

interface SpotifyChatResultOptions {
  toolName: "get_spotify_album" | "get_spotify_artist_top_tracks";
  intro: string;
  result: unknown;
  dynamic: boolean;
  failed?: boolean;
}

export function renderSpotifyChatResult({
  toolName,
  intro,
  result,
  dynamic,
  failed = false,
}: SpotifyChatResultOptions) {
  const reload = vi.fn();
  const message = {
    id: `synthetic-${toolName}`,
    role: "assistant",
    parts: [
      { type: "text", text: intro, state: "done" },
      {
        type: dynamic ? "dynamic-tool" : `tool-${toolName}`,
        toolName,
        toolCallId: `synthetic-${toolName}`,
        state: !dynamic && failed ? "output-error" : "output-available",
        errorText:
          !dynamic && failed ? "Synthetic provider failure" : undefined,
        input: {},
        output: dynamic
          ? {
              ...(failed ? { isError: true } : {}),
              content: [{ type: "text", text: JSON.stringify(result) }],
            }
          : result,
      },
      {
        type: "tool-get_chats",
        toolCallId: "synthetic-chats",
        state: "output-available",
        input: {},
        output: {
          chats: [
            {
              id: "synthetic-chat",
              title: "Synthetic saved chat",
              accountId: "synthetic-account",
              sessionId: "synthetic-session",
              updatedAt: "2026-10-22T00:00:00Z",
            },
          ],
        },
      },
      { type: "text", text: "The conversation continues.", state: "done" },
    ],
  } as unknown as UIMessage;
  render(
    <MessageParts
      message={message}
      mode="view"
      setMode={() => {}}
      status="ready"
      reload={reload}
    />,
  );
  expect(screen.getByText(intro)).toBeTruthy();
  expect(screen.getByText("The conversation continues.")).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: "Synthetic saved chat" })
      .getAttribute("href"),
  ).toBe("/sessions/synthetic-session/chats/synthetic-chat");
  return reload;
}
