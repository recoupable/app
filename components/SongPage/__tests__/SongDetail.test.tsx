// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SongDetail from "@/components/SongPage/SongDetail";
import useMusicGeneration from "@/hooks/useMusicGeneration";
import { MusicGenerationRequestError } from "@/lib/music/getMusicGeneration";
import type { MusicGenerationDetail } from "@/types/Music";

vi.mock("@/hooks/useMusicGeneration", () => ({ default: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const ID = "11111111-2222-4333-8444-555555555555";

const detail = (
  over: Partial<MusicGenerationDetail> = {},
): MusicGenerationDetail => ({
  id: ID,
  status: "completed",
  prompt: "Genre: lo-fi soul. BPM: 82.",
  lyrics: "[verse]\nMorning light",
  model: "minimax/music-3",
  duration_seconds: 25.87,
  audio_url: "https://cdn.example/a.wav",
  error_message: null,
  created_at: "2026-08-21T12:00:00.000Z",
  updated_at: "2026-08-21T12:00:00.000Z",
  seed: 42,
  logs: [],
  ...over,
});

const mock = (value: Record<string, unknown>) =>
  vi.mocked(useMusicGeneration).mockReturnValue(value as never);

describe("SongDetail", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the song once the read lands", () => {
    mock({
      data: { status: "success", generation: detail() },
      isLoading: false,
      error: null,
    });

    render(<SongDetail generationId={ID} />);

    // The prompt also names the song in the breadcrumb, so read the block by id.
    expect(screen.getByTestId("music-detail-prompt").textContent).toBe(
      "Genre: lo-fi soul. BPM: 82.",
    );
    expect(screen.getByTestId("music-detail-seed").textContent).toBe("42");
  });

  it("shows a skeleton while loading, since there is no summary to start from", () => {
    mock({ data: undefined, isLoading: true, error: null });

    render(<SongDetail generationId={ID} />);

    expect(screen.queryByText("Genre: lo-fi soul. BPM: 82.")).toBeNull();
    expect(screen.queryByTestId("song-error")).toBeNull();
  });

  it("explains a 403 instead of showing an error", () => {
    // The URL is meant to be passed around, so it will reach people who cannot
    // open it. That must read as an answer, not a fault.
    mock({
      data: undefined,
      isLoading: false,
      error: new MusicGenerationRequestError(403, "no"),
    });

    render(<SongDetail generationId={ID} />);

    expect(screen.getByTestId("song-no-access")).toBeDefined();
    expect(screen.queryByTestId("song-error")).toBeNull();
  });

  it("distinguishes a missing song from one you cannot see", () => {
    mock({
      data: undefined,
      isLoading: false,
      error: new MusicGenerationRequestError(404, "no"),
    });

    render(<SongDetail generationId={ID} />);

    expect(screen.getByTestId("song-not-found")).toBeDefined();
    expect(screen.queryByTestId("song-no-access")).toBeNull();
  });

  it("falls back to a plain error for anything else", () => {
    mock({ data: undefined, isLoading: false, error: new Error("network") });

    render(<SongDetail generationId={ID} />);

    expect(screen.getByTestId("song-error")).toBeDefined();
  });

  it("shows the failure reason for a failed generation", () => {
    mock({
      data: {
        status: "success",
        generation: detail({
          status: "failed",
          audio_url: null,
          seed: null,
          error_message: "Lyrics structure tags were rejected.",
        }),
      },
      isLoading: false,
      error: null,
    });

    render(<SongDetail generationId={ID} />);

    expect(
      screen.getByText("Lyrics structure tags were rejected."),
    ).toBeDefined();
  });

  it("renders exactly one page heading", () => {
    mock({
      data: { status: "success", generation: detail() },
      isLoading: false,
      error: null,
    });

    render(<SongDetail generationId={ID} />);

    expect(screen.getAllByText("Song details")).toHaveLength(1);
  });

  // The page is reached from a Telegram link, so the way back to the gallery
  // has to be on the page itself (recoupable/app#1999).
  it("links back to /music in a breadcrumb, naming the song by its prompt", () => {
    mock({
      data: { status: "success", generation: detail() },
      isLoading: false,
      error: null,
    });
    render(<SongDetail generationId={ID} />);
    const crumb = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(crumb.querySelector('a[href="/music"]')?.textContent).toBe("Music");
    expect(crumb.textContent).toContain("Genre: lo-fi soul. BPM: 82.");
  });

  it("keeps the way back even when the song cannot be shown", () => {
    mock({
      data: undefined,
      isLoading: false,
      error: new MusicGenerationRequestError(403, "no"),
    });
    render(<SongDetail generationId={ID} />);
    const crumb = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(crumb.querySelector('a[href="/music"]')).not.toBeNull();
    expect(crumb.textContent).toContain("Song");
  });
});
