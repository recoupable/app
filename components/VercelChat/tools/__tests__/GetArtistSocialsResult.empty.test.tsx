// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import type { Social, SocialsResponse } from "@/types/Social";
import { MessageParts } from "@/components/VercelChat/MessageParts";
import GetArtistSocialsResult from "../GetArtistSocialsResult";

const empty: SocialsResponse = {
  status: "success",
  success: true,
  socials: [],
  pagination: { page: 1, limit: 10, total_count: 0, total_pages: 0 },
};
const social: Social = {
  id: "synthetic-social",
  social_id: "synthetic-social",
  username: "synthetic_artist",
  avatar: null,
  profile_url: "https://instagram.com/synthetic_artist?si=a%2Bb#bio",
  region: null,
  bio: null,
  follower_count: null,
  following_count: null,
  updated_at: "2026-10-22T00:00:00Z",
};

const nullishCases = [
  ["null", { ...empty, socials: null }],
  [
    "omitted",
    { status: "success", success: true, pagination: empty.pagination },
  ],
] as const;

function renderChatResult(
  result: unknown,
  type: "dynamic-tool" | "tool-get_artist_socials" = "dynamic-tool",
) {
  const reload = vi.fn();
  const message = {
    id: "synthetic-socials",
    role: "assistant",
    parts: [
      { type: "text", text: "I checked the supplied artist.", state: "done" },
      {
        type,
        toolName: "get_artist_socials",
        toolCallId: "synthetic-socials",
        state: "output-available",
        input: {},
        output:
          type === "dynamic-tool"
            ? { content: [{ type: "text", text: JSON.stringify(result) }] }
            : result,
      },
      {
        type: "dynamic-tool",
        toolName: "get_chats",
        toolCallId: "synthetic-chats",
        state: "output-available",
        input: {},
        output: {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                chats: [
                  {
                    id: "synthetic-chat",
                    title: "Synthetic saved chat",
                    accountId: "synthetic-account",
                    sessionId: "synthetic-session",
                    updatedAt: "2026-10-01T00:00:00Z",
                  },
                ],
              }),
            },
          ],
        },
      },
      { type: "text", text: "The conversation continues.", state: "done" },
    ],
  } as unknown as UIMessage;
  return {
    ...render(
      <MessageParts
        message={message}
        mode="view"
        setMode={() => {}}
        status="ready"
        reload={reload}
      />,
    ),
    reload,
  };
}

afterEach(cleanup);

describe("Successful social searches with no returned profiles", () => {
  it("states the empty outcome without a misleading found heading or controls", () => {
    const { container } = render(<GetArtistSocialsResult result={empty} />);
    expect(screen.getByText("No social profiles returned.").tagName).toBe("P");
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it("describes the returned page without claiming the catalog contains zero profiles", () => {
    render(
      <GetArtistSocialsResult
        result={{
          ...empty,
          pagination: { page: 3, limit: 10, total_count: 11, total_pages: 2 },
        }}
      />,
    );
    expect(screen.getByText("No social profiles returned.")).toBeTruthy();
    expect(
      screen.queryByText(/0 platforms|no platforms connected/i),
    ).toBeNull();
  });

  it("keeps an empty result textual even when the caller supplies card decoration", () => {
    render(
      <GetArtistSocialsResult
        result={empty}
        title="Verified profiles"
        icon={<span>Custom icon</span>}
      />,
    );
    expect(screen.getByText("No social profiles returned.")).toBeTruthy();
    expect(screen.queryByText("Verified profiles")).toBeNull();
    expect(screen.queryByText("Custom icon")).toBeNull();
  });

  it.each(nullishCases)(
    "handles a %s profile list supplied through the wire cast",
    (_name, result) => {
      render(
        <GetArtistSocialsResult
          result={result as unknown as SocialsResponse}
        />,
      );
      expect(screen.getByText("No social profiles returned.")).toBeTruthy();
      expect(screen.queryByRole("heading")).toBeNull();
      expect(screen.queryByRole("link")).toBeNull();
    },
  );

  it.each([1, 2])(
    "preserves the existing populated result for %i profiles",
    (count) => {
      render(
        <GetArtistSocialsResult
          result={{
            ...empty,
            socials: Array.from({ length: count }, (_, i) => ({
              ...social,
              social_id: `synthetic-${i}`,
            })),
          }}
        />,
      );
      expect(
        screen.getByRole("heading", { name: "Artist Socials Found" }),
      ).toBeTruthy();
      expect(
        screen.getByText(`${count} ${count === 1 ? "platform" : "platforms"}`),
      ).toBeTruthy();
      expect(screen.queryByText("No social profiles returned.")).toBeNull();
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(count);
      for (const link of links) {
        expect(link.getAttribute("href")).toBe(social.profile_url);
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.getAttribute("rel")).toBe("noopener noreferrer");
        expect(link.textContent).toBe("Instagram@synthetic_artist");
      }
    },
  );

  it("preserves custom title and icon for populated results", () => {
    render(
      <GetArtistSocialsResult
        result={{ ...empty, socials: [social] }}
        title="Verified profiles"
        icon={<span>Custom icon</span>}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Verified profiles" }),
    ).toBeTruthy();
    expect(screen.getByText("Custom icon")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe(
      social.profile_url,
    );
  });

  it.each([undefined, "Supplied lookup failure."])(
    "preserves unsuccessful status handling with errorText=%s",
    (errorText) => {
      render(
        <GetArtistSocialsResult
          result={{ ...empty, status: "error", success: false }}
          errorText={errorText}
        />,
      );
      expect(
        screen.getByText(errorText ?? "Artist socials failed"),
      ).toBeTruthy();
      expect(screen.queryByText("No social profiles returned.")).toBeNull();
      expect(screen.queryByRole("link")).toBeNull();
    },
  );

  it.each(["dynamic-tool", "tool-get_artist_socials"] as const)(
    "keeps empty %s output alongside prose and a typed result",
    (type) => {
      const { reload } = renderChatResult(empty, type);
      expect(screen.getByText("No social profiles returned.")).toBeTruthy();
      expect(
        screen.queryByRole("heading", { name: "Artist Socials Found" }),
      ).toBeNull();
      expect(screen.getByText("I checked the supplied artist.")).toBeTruthy();
      expect(screen.getByText("The conversation continues.")).toBeTruthy();
      expect(
        screen
          .getByRole("link", { name: "Synthetic saved chat" })
          .getAttribute("href"),
      ).toBe("/sessions/synthetic-session/chats/synthetic-chat");
      expect(reload).not.toHaveBeenCalled();
    },
  );

  it.each(nullishCases)(
    "handles a %s profile list through the actual MCP result parser",
    (_name, result) => {
      const { reload } = renderChatResult(result);
      expect(screen.getByText("No social profiles returned.")).toBeTruthy();
      expect(screen.getByText("I checked the supplied artist.")).toBeTruthy();
      expect(screen.getByText("The conversation continues.")).toBeTruthy();
      expect(
        screen.getByRole("link", { name: "Synthetic saved chat" }),
      ).toBeTruthy();
      expect(reload).not.toHaveBeenCalled();
    },
  );
});
