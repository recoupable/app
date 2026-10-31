// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UpdateArtistInfoSuccess from "../UpdateArtistInfoSuccess";
import type { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";
import type { Json } from "@/types/database.types";

const { getArtists } = vi.hoisted(() => ({ getArtists: vi.fn() }));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ getArtists }),
}));

const denyNetwork = vi.fn(() => {
  throw new Error("Knowledge rendering tests forbid network");
});
beforeEach(() => {
  getArtists.mockClear();
  denyNetwork.mockClear();
  for (const name of ["fetch", "XMLHttpRequest", "WebSocket"]) {
    vi.stubGlobal(name, denyNetwork);
  }
});
afterEach(() => {
  try {
    cleanup();
    expect(denyNetwork).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});

const first = {
  url: "https://files.invalid/brief.txt?signature=a%2Bb#notes",
  name: "Supplied brief",
  type: "text/plain",
  extra: { source: "supplied" },
};
const second = {
  url: "https://files.invalid/reference.pdf",
  name: "Supplied reference",
  type: "application/pdf",
};
const profile: ArtistProfile = {
  id: "synthetic-artist",
  account_id: "synthetic-artist",
  name: "Synthetic artist",
  timestamp: null,
  image: null,
  instruction: "Supplied instructions",
  label: "Supplied label",
  organization: "Supplied organization",
  company_name: null,
  job_title: null,
  role_type: null,
  updated_at: "2026-10-01T00:00:00Z",
  knowledges: null,
};

function showKnowledge(knowledges: Json | null) {
  return render(
    <>
      <p>The supplied profile update is below.</p>
      <UpdateArtistInfoSuccess
        result={{
          success: true,
          message: "Supplied confirmation",
          artistProfile: { ...profile, knowledges },
        }}
      />
      <p>The conversation continues.</p>
    </>,
  );
}

function expectProfile() {
  for (const text of [
    "The supplied profile update is below.",
    "The conversation continues.",
    "Synthetic artist",
    "Supplied instructions",
    "Supplied label",
    "Supplied organization",
  ]) {
    expect(screen.getByText(text)).toBeTruthy();
  }
  expect(getArtists).toHaveBeenCalledTimes(1);
}

describe("artist update stored knowledge rendering", () => {
  it.each<[Json]>([
    [null],
    [true],
    [7],
    ["unreadable"],
    [[]],
    [{}],
    [{ url: first.url, name: "Missing type" }],
    [{ url: 42, name: "Wrong URL field", type: "text/plain" }],
    [{ url: first.url, name: { nested: "not text" }, type: "text/plain" }],
    [
      {
        url: first.url,
        name: "Wrong type field",
        type: { nested: "not text" },
      },
    ],
  ])("keeps valid neighbors and reports unreadable row %j", (invalid) => {
    showKnowledge([first, invalid, second]);
    expectProfile();
    expect(screen.getByText("Knowledge Base (2)")).toBeTruthy();
    expect(
      screen.getByText("1 knowledge entry could not be displayed."),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual([first.url, second.url]);
    expect(screen.getByText(first.name)).toBeTruthy();
    expect(screen.getByText(second.name)).toBeTruthy();
    expect(screen.getByText(first.type)).toBeTruthy();
    expect(screen.getByText(second.type)).toBeTruthy();
  });

  it("reports all unreadable entries without an empty knowledge section", () => {
    showKnowledge([null, { url: 4, name: false, type: [] }]);
    expectProfile();
    expect(
      screen.getByText("2 knowledge entries could not be displayed."),
    ).toBeTruthy();
    expect(screen.queryByText(/Knowledge Base/)).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("preserves all valid rows, raw URLs, extra fields and order", () => {
    showKnowledge([first, second]);
    expectProfile();
    expect(
      screen.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual([first.url, second.url]);
    expect(screen.getByText("Knowledge Base (2)")).toBeTruthy();
    expect(screen.queryByText(/could not be displayed/)).toBeNull();
  });

  it("preserves supplied duplicate rows instead of deduplicating the response", () => {
    showKnowledge([first, { ...first, name: "Supplied duplicate" }]);
    expectProfile();
    expect(
      screen.getAllByRole("link").map((link) => link.getAttribute("href")),
    ).toEqual([first.url, first.url]);
    expect(screen.getByText("Supplied duplicate")).toBeTruthy();
    expect(screen.queryByText(/could not be displayed/)).toBeNull();
  });

  it("retains the existing handling of string fields without new content policies", () => {
    showKnowledge([{ url: "", name: "", type: "" }]);
    expectProfile();
    expect(screen.getByText("Knowledge Base (1)")).toBeTruthy();
    expect(screen.queryByText(/could not be displayed/)).toBeNull();
  });

  it.each<[Json]>([
    [null],
    [[]],
    ["existing scalar"],
    [{ existing: "object" }],
  ])("retains the existing non-list path for %j", (value) => {
    showKnowledge(value);
    expectProfile();
    expect(screen.queryByText(/Knowledge Base/)).toBeNull();
    expect(screen.queryByText(/could not be displayed/)).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("retains the supplied confirmation when no profile is returned", () => {
    render(
      <UpdateArtistInfoSuccess
        result={{ success: true, message: "Supplied confirmation" }}
      />,
    );
    expect(screen.getByText("Supplied confirmation")).toBeTruthy();
    expect(
      screen.queryByText(/Knowledge Base|could not be displayed/),
    ).toBeNull();
    expect(getArtists).toHaveBeenCalledTimes(1);
  });
});
