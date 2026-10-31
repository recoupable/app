// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchApiResult, {
  type ParsedSearchResult,
  type SearchApiResultType,
  type SearchApiErrorResult,
} from "../SearchApiResult";
import { parseMcpToolOutput } from "@/lib/chat/parseMcpToolOutput";
import { isSearchProgressUpdate } from "@/lib/search/searchProgressUtils";

const rows: ParsedSearchResult[] = [
  {
    title: "Supplied source <one>",
    url: "https://research.invalid/one?x=a%2Bb#notes",
    snippet: "Unchanged supplied snippet",
    date: "2026-10-01",
  },
  { title: "Supplied source two", url: "https://other.invalid/two" },
  {
    title: "Supplied source <one>",
    url: "https://research.invalid/one?x=a%2Bb#notes",
  },
];
const denyNetwork = vi.fn(() => {
  throw new Error("Terminal search tests forbid requests");
});
beforeEach(() => {
  denyNetwork.mockClear();
  for (const name of ["fetch", "XMLHttpRequest", "WebSocket"])
    vi.stubGlobal(name, denyNetwork);
});
afterEach(() => {
  try {
    cleanup();
    expect(denyNetwork).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});
function show(result: React.ComponentProps<typeof SearchApiResult>["result"]) {
  return render(
    <>
      <p>Answer before.</p>
      <SearchApiResult result={result} />
      <p>Answer after.</p>
    </>,
  );
}
function expectProse() {
  expect(screen.getByText("Answer before.")).toBeTruthy();
  expect(screen.getByText("Answer after.")).toBeTruthy();
}
function expectQuietError(container: HTMLElement, message: string) {
  expect(
    Array.from(container.querySelectorAll("p")).filter(
      (x) => x.textContent === message,
    ),
  ).toHaveLength(1);
  expect(container.querySelectorAll("a")).toHaveLength(0);
  expect(screen.queryByText("No search results found.")).toBeNull();
  expect(screen.queryByText(/Reviewing sources/)).toBeNull();
  expect(
    container.querySelector(
      "button,input,[tabindex],[aria-live],[role=alert],script",
    ),
  ).toBeNull();
  expectProse();
}

describe("terminal search result outcomes", () => {
  it.each([
    [
      "Search failed: provider unavailable.",
      "Search failed: provider unavailable.",
    ],
    ["", "Error retrieving search results"],
    [" \t\n ", "Error retrieving search results"],
    [" <script>literal error</script> ", " <script>literal error</script> "],
  ])(
    "shows the declared failure message %j without treating it as no results",
    (message, expected) => {
      const { container } = show({
        success: false,
        message,
      });
      expectQuietError(container, expected);
      expect(container.querySelector(".text-destructive-text")).toBeTruthy();
    },
  );
  it.each([1, 3])(
    "labels %i returned rows as sources rather than ongoing review",
    (count) => {
      const { container } = show({
        results: rows.slice(0, count),
        formatted: "Supplied formatted text",
      });
      expect(screen.getByText(`Sources · ${count}`)).toBeTruthy();
      expect(screen.queryByText(/Reviewing sources/)).toBeNull();
      expect(container.querySelectorAll("a")).toHaveLength(count);
      expectProse();
    },
  );
  it("retains successful row text, hrefs, order, duplicates and link attributes", () => {
    const { container } = show({
      results: rows,
      formatted: "Not an extra response",
    });
    const links = Array.from(container.querySelectorAll("a"));
    expect(links.map((x) => x.getAttribute("href"))).toEqual(
      rows.map((x) => x.url),
    );
    for (const [i, link] of links.entries()) {
      expect(link.textContent).toContain(rows[i].title);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
      expect(link.querySelector('img[alt=""]')).toBeTruthy();
    }
    expect(screen.queryByText("Not an extra response")).toBeNull();
    expect(screen.queryByText(rows[0].snippet!)).toBeNull();
    expectProse();
  });
  it("retains the existing empty-success sentence and layout", () => {
    const { container } = show({
      results: [],
      formatted: "No search results found.",
    });
    expect(screen.getAllByText("No search results found.")).toHaveLength(1);
    expect(
      container.querySelector(".text-destructive-text,a,button"),
    ).toBeNull();
    expectProse();
  });
  it("retains the existing null-result error control", () => {
    const { container } = show(null as unknown as SearchApiResultType);
    expectQuietError(container, "Error retrieving search results");
  });
  it.each([false, true])(
    "handles real-parser terminal data with API failure=%j",
    (failed) => {
      const value = failed
        ? { success: false, message: "Search failed: synthetic error" }
        : { results: rows.slice(0, 1), formatted: "Supplied format" };
      const parsed = parseMcpToolOutput({
        content: [{ type: "text", text: JSON.stringify(value) }],
      });
      expect(parsed.kind).toBe("data");
      if (parsed.kind !== "data")
        throw new Error("Expected structured API data");
      expect(isSearchProgressUpdate(parsed.value)).toBe(false);
      const { container } = show(
        parsed.value as SearchApiResultType | SearchApiErrorResult,
      );
      if (failed) expectQuietError(container, "Search failed: synthetic error");
      else {
        expect(screen.getByText("Sources · 1")).toBeTruthy();
        expect(container.querySelector("a")?.getAttribute("href")).toBe(
          rows[0].url,
        );
        expectProse();
      }
    },
  );
  it("replaces terminal errors, results and empty outcomes without stale text", () => {
    const { container, rerender } = show({
      success: false,
      message: "Search failed: first",
    });
    expectQuietError(container, "Search failed: first");
    rerender(
      <SearchApiResult result={{ results: rows.slice(0, 1), formatted: "" }} />,
    );
    expect(screen.getByText("Sources · 1")).toBeTruthy();
    expect(screen.queryByText("Search failed: first")).toBeNull();
    rerender(<SearchApiResult result={{ results: [], formatted: "" }} />);
    expect(screen.getByText("No search results found.")).toBeTruthy();
    expect(container.querySelector("a")).toBeNull();
    rerender(
      <SearchApiResult
        result={{
          success: false,
          message: "Search failed: last",
        }}
      />,
    );
    expect(screen.getByText("Search failed: last")).toBeTruthy();
    expect(screen.queryByText("No search results found.")).toBeNull();
  });
});
