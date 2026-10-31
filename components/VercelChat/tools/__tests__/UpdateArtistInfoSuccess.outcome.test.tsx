// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UpdateArtistInfoSuccess, {
  type UpdateArtistInfoSuccessProps,
} from "../UpdateArtistInfoSuccess";
import type { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";
import { parseMcpToolOutput } from "@/lib/chat/parseMcpToolOutput";

const { getArtists } = vi.hoisted(() => ({ getArtists: vi.fn() }));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ getArtists }),
}));
const denyNetwork = vi.fn(() => {
  throw new Error("Artist update outcome tests forbid requests");
});
beforeEach(() => {
  getArtists.mockClear();
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

const knowledge = {
  url: "https://files.invalid/brief.txt?signature=a%2Bb#notes",
  name: "Supplied brief",
  type: "text/plain",
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
  knowledges: [knowledge],
};

function exchange(result: UpdateArtistInfoSuccessProps["result"]) {
  return (
    <>
      <p>Answer before.</p>
      <UpdateArtistInfoSuccess result={result} />
      <p>Answer after.</p>
    </>
  );
}
function expectProse() {
  expect(screen.getByText("Answer before.")).toBeTruthy();
  expect(screen.getByText("Answer after.")).toBeTruthy();
}
function expectFailure(container: HTMLElement, message: string) {
  expect(
    Array.from(container.querySelectorAll("p")).filter(
      (p) => p.textContent === message,
    ),
  ).toHaveLength(1);
  expect(
    container.querySelector(
      "svg,img,a,button,input,[tabindex],[aria-live],[role=alert],script",
    ),
  ).toBeNull();
  expect(screen.queryByText("Synthetic artist")).toBeNull();
  expect(screen.queryByText("Supplied instructions")).toBeNull();
  expect(screen.queryByText("Supplied organization")).toBeNull();
  expect(screen.queryByText("Supplied brief")).toBeNull();
  expectProse();
  expect(getArtists).toHaveBeenCalledTimes(1);
}

describe("artist profile update outcomes", () => {
  it.each([
    ["Artist does not exist", "Artist does not exist"],
    ["", "Failed to update artist info."],
    [" \t\n ", "Failed to update artist info."],
    [
      " <script>literal failure</script> ",
      " <script>literal failure</script> ",
    ],
  ])(
    "shows declared failure %j without a success confirmation",
    (message, expected) => {
      const { container } = render(exchange({ success: false, message }));
      expectFailure(container, expected);
    },
  );

  it("does not present optional profile details as a successful failed update", () => {
    const { container } = render(
      exchange({
        success: false,
        message: "Failed to save profile",
        artistProfile: profile,
      }),
    );
    expectFailure(container, "Failed to save profile");
  });

  it("retains the supplied successful confirmation without a profile", () => {
    const { container } = render(
      exchange({ success: true, message: "Supplied confirmation" }),
    );
    expect(screen.getByText("Supplied confirmation")).toBeTruthy();
    expect(container.querySelectorAll("svg")).toHaveLength(1);
    expect(container.querySelector("a,img")).toBeNull();
    expectProse();
    expect(getArtists).toHaveBeenCalledTimes(1);
  });

  it("retains real successful profile, instructions, organization and knowledge", () => {
    render(
      exchange({
        success: true,
        message: "Supplied confirmation",
        artistProfile: profile,
      }),
    );
    for (const text of [
      "Synthetic artist",
      "Supplied instructions",
      "Supplied label",
      "Supplied organization",
      "Knowledge Base (1)",
      "Supplied brief",
    ])
      expect(screen.getByText(text)).toBeTruthy();
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe(knowledge.url);
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expectProse();
    expect(getArtists).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])(
    "handles actual-parser structured update success=%j",
    (success) => {
      const value = {
        success,
        message: success ? "Supplied confirmation" : "Artist does not exist",
      };
      const parsed = parseMcpToolOutput({
        content: [{ type: "text", text: JSON.stringify(value) }],
      });
      expect(parsed.kind).toBe("data");
      if (parsed.kind !== "data") throw new Error("Expected structured result");
      const { container } = render(
        exchange(parsed.value as UpdateArtistInfoSuccessProps["result"]),
      );
      if (success) {
        expect(screen.getByText("Supplied confirmation")).toBeTruthy();
        expect(container.querySelectorAll("svg")).toHaveLength(1);
        expectProse();
        expect(getArtists).toHaveBeenCalledTimes(1);
      } else expectFailure(container, "Artist does not exist");
    },
  );

  it("replaces failure and success outcomes without stale confirmation or new refresh", () => {
    const { container, rerender } = render(
      exchange({ success: false, message: "First failure" }),
    );
    expectFailure(container, "First failure");
    rerender(exchange({ success: true, message: "Supplied confirmation" }));
    expect(screen.getByText("Supplied confirmation")).toBeTruthy();
    expect(screen.queryByText("First failure")).toBeNull();
    rerender(exchange({ success: false, message: "Second failure" }));
    expectFailure(container, "Second failure");
    expect(screen.queryByText("Supplied confirmation")).toBeNull();
  });
});
