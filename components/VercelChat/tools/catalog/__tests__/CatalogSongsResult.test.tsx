// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UIMessage } from "ai";
import type { CatalogSong } from "@/lib/catalog/getCatalogSongs";
import { MessageParts } from "@/components/VercelChat/MessageParts";
import CatalogSongsResult from "../CatalogSongsResult";
import InsertCatalogSongsList from "../InsertCatalogSongsList";
const upload = vi.hoisted(() =>
  vi.fn(() => ({
    isUploading: false,
    uploadResult: null,
    uploadError: null,
    uploadProgress: { total: 0, current: 0 },
    handleFileSelect: vi.fn(),
  })),
);
vi.mock("@/hooks/useCatalogSongsFileSelect", () => ({
  useCatalogSongsFileSelect: upload,
}));
const network = vi.fn(() => {
  throw new Error("Filter rendering must stay local");
});
beforeEach(() => vi.stubGlobal("fetch", network));
afterEach(() => {
  try {
    cleanup();
    expect(network).not.toHaveBeenCalled();
    for (const result of upload.mock.results) {
      if (result.type === "return")
        expect(result.value.handleFileSelect).not.toHaveBeenCalled();
    }
  } finally {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  }
});
it("enables the first CSV upload with the catalog route ID and no songs", () => {
  render(
    <CatalogSongsResult
      result={{ success: true, songs: [] }}
      catalogId="new-catalog"
    />,
  );
  expect(upload).toHaveBeenCalledWith("new-catalog");
  expect(
    screen.getByRole("button", { name: "Upload CSV File" }),
  ).toHaveProperty("disabled", false);
});

const song: CatalogSong = {
  catalog_id: "synthetic-catalog",
  isrc: "SYNTHETIC001",
  name: "Complete song",
  album: "Synthetic album",
  artwork_url: null,
  notes: "Supplied notes",
  updated_at: "2026-10-22T00:00:00Z",
  artists: [
    {
      id: "synthetic-artist",
      name: "Synthetic artist",
      timestamp: 0,
    },
  ],
};
const incompleteSongs: CatalogSong[] = [
  { ...song, isrc: "SYNTHETIC002", name: "Missing notes", notes: null },
  { ...song, isrc: "SYNTHETIC003", name: "Missing album", album: null },
];
const filteredNote =
  "No songs match this filter. Turn it off to show all returned songs.";

function renderChatCatalog(
  songs: CatalogSong[],
  toolName: "select_catalog_songs" | "insert_catalog_songs",
  dynamic: boolean,
) {
  const reload = vi.fn();
  const result = {
    success: true,
    songs,
    message: "Returned catalog rows.",
    pagination: { total_count: 500, page: 2, limit: 2, total_pages: 250 },
  };
  const message = {
    id: "synthetic-catalog",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "Here are the supplied catalog rows.",
        state: "done",
      },
      {
        type: dynamic ? "dynamic-tool" : `tool-${toolName}`,
        toolName,
        toolCallId: "synthetic-catalog",
        state: "output-available",
        input: {},
        output: dynamic
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

describe.each(["select_catalog_songs", "insert_catalog_songs"] as const)(
  "%s filter feedback",
  (toolName) => {
    it.each([true, false])(
      "explains all hidden rows with dynamic=%s and restores them locally",
      (dynamic) => {
        const { reload } = renderChatCatalog(
          incompleteSongs,
          toolName,
          dynamic,
        );
        const toggle = screen.getByRole("switch", {
          name: "Hide items with missing info",
        });
        const original = screen.getByRole("table").outerHTML;
        expect(toggle.getAttribute("aria-checked")).toBe("false");
        toggle.focus();
        fireEvent.click(toggle);
        expect(screen.getByText(filteredNote).tagName).toBe("P");
        expect(screen.queryByRole("table")).toBeNull();
        expect(screen.getByRole("switch")).toBe(toggle);
        expect(toggle.getAttribute("aria-checked")).toBe("true");
        expect(document.activeElement).toBe(toggle);
        expect(
          screen.getByText("Here are the supplied catalog rows."),
        ).toBeTruthy();
        expect(screen.getByText("The conversation continues.")).toBeTruthy();
        expect(
          screen.getByRole("link", { name: "Synthetic saved chat" }),
        ).toBeTruthy();
        fireEvent.click(toggle);
        expect(screen.queryByText(filteredNote)).toBeNull();
        expect(screen.getByRole("table").outerHTML).toBe(original);
        expect(screen.getByText("Showing 2 songs")).toBeTruthy();
        expect(document.activeElement).toBe(toggle);
        expect(reload).not.toHaveBeenCalled();
      },
    );
  },
);

it("counts hidden rows against the returned page and preserves the retained row", () => {
  renderChatCatalog([song, incompleteSongs[0]], "select_catalog_songs", true);
  const retainedRow = screen
    .getByText("Complete song")
    .closest("tr")!.outerHTML;
  fireEvent.click(screen.getByRole("switch"));
  expect(
    screen.getByText("Showing 1 of 2 returned songs (1 hidden)"),
  ).toBeTruthy();
  expect(screen.queryByText("Missing notes")).toBeNull();
  expect(screen.getByText("Complete song").closest("tr")!.outerHTML).toBe(
    retainedRow,
  );
  expect(screen.queryByText(filteredNote)).toBeNull();
  expect(screen.queryByText(/500/)).toBeNull();
});

it("keeps the existing footer when the filter hides no rows", () => {
  render(<CatalogSongsResult result={{ success: true, songs: [song] }} />);
  fireEvent.click(screen.getByRole("switch"));
  expect(screen.getByText("Showing 1 song")).toBeTruthy();
  expect(screen.queryByText(/hidden|No songs match/)).toBeNull();
});

it.each([undefined, 0])(
  "explains a standalone empty list with unfilteredCount=%s without controls",
  (unfilteredCount) => {
    const { container } = render(
      <InsertCatalogSongsList songs={[]} unfilteredCount={unfilteredCount} />,
    );
    expect(screen.getByText("No songs returned.").tagName).toBe("P");
    expect(
      container.querySelector(
        "table, button, svg, a, [aria-live], [role='status']",
      ),
    ).toBeNull();
  },
);

it("distinguishes a fully filtered list from an empty response", () => {
  render(<InsertCatalogSongsList songs={[]} unfilteredCount={2} />);
  expect(screen.getByText(filteredNote)).toBeTruthy();
  expect(screen.queryByText("No songs returned.")).toBeNull();
});

it("preserves an unsuccessful parent response without adding an empty-list claim", () => {
  render(
    <CatalogSongsResult
      result={{ success: false, error: "Supplied catalog failure." }}
    />,
  );
  expect(screen.getByText("Supplied catalog failure.")).toBeTruthy();
  expect(screen.queryByText(/No songs/)).toBeNull();
  expect(screen.queryByRole("switch")).toBeNull();
});
