// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import GetChatsResult, { type GetChatsResultType } from "../GetChatsResult";

afterEach(cleanup);

describe("empty chat lookup presentation", () => {
  it.each([
    ["empty chats", { chats: [] }],
    ["null chats", { chats: null }],
    ["omitted chats", {}],
    ["null result", null],
    ["omitted result", undefined],
  ])("uses one quiet sentence for %s", (_, result) => {
    const { container } = render(
      <GetChatsResult result={result as unknown as GetChatsResultType} />,
    );
    const paragraph = screen.getByText("No chats returned.");
    expect(paragraph.tagName).toBe("P");
    expect(container.childElementCount).toBe(1);
    expect(container.firstElementChild).toBe(paragraph);
    expect(paragraph.className).toContain("text-muted-foreground");
    expect(
      container.querySelector("svg, a, button, [tabindex], [aria-live]"),
    ).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByText("No chats found")).toBeNull();
    expect(screen.queryByText("No chats available")).toBeNull();
  });

  it("preserves populated row order, literal titles, fallback and destinations", () => {
    const { container } = render(
      <GetChatsResult
        result={{
          chats: [
            {
              id: "first-chat",
              title: "<svg onload=synthetic()>",
              accountId: "synthetic-account",
              sessionId: "first-session",
              updatedAt: "2026-10-22T00:00:00Z",
            },
            {
              id: "second-chat",
              title: "   ",
              accountId: "synthetic-account",
              sessionId: "second-session",
              updatedAt: "2026-10-22T00:00:00Z",
            },
          ],
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Chats" })).toBeTruthy();
    expect(screen.getByText("Found 2 chats")).toBeTruthy();
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "<svg onload=synthetic()>",
      "Untitled Chat",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/sessions/first-session/chats/first-chat",
      "/sessions/second-session/chats/second-chat",
    ]);
    for (const link of links) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(container.querySelector("[onload]")).toBeNull();
    expect(screen.queryByText("No chats returned.")).toBeNull();
  });
});
