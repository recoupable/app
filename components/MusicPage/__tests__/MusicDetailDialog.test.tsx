// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MusicDetailDialog from "@/components/MusicPage/MusicDetailDialog";
import useMusicGeneration from "@/hooks/useMusicGeneration";
import type { MusicGeneration, MusicGenerationDetail } from "@/types/Music";

vi.mock("@/hooks/useMusicGeneration", () => ({ default: vi.fn() }));

const LONG_PROMPT =
  "Genre: lo-fi soul. BPM: 82. Key: D minor. Hazy, late-night, warm tape saturation, " +
  "brushed drums, muted Rhodes chords and a distant upright bass that never rushes.";
const LONG_LYRICS = Array.from({ length: 12 }, (_, i) => `[verse ${i + 1}]\nLine ${i + 1}`).join(
  "\n",
);

const summary = (over: Partial<MusicGeneration> = {}): MusicGeneration => ({
  id: "11111111-2222-4333-8444-555555555555",
  status: "completed",
  prompt: LONG_PROMPT,
  lyrics: LONG_LYRICS,
  model: "minimax/music-3",
  duration_seconds: 60,
  audio_url: "https://cdn.example/music/abc.wav",
  error_message: null,
  created_at: "2026-08-21T12:00:00.000Z",
  updated_at: "2026-08-21T12:00:00.000Z",
  ...over,
});

const detail = (over: Partial<MusicGenerationDetail> = {}): MusicGenerationDetail => ({
  ...summary(),
  seed: 42,
  logs: [],
  ...over,
});

const mockDetail = (data: MusicGenerationDetail | undefined, isLoading = false) => {
  vi.mocked(useMusicGeneration).mockReturnValue({
    data: data ? { status: "success", generation: data } : undefined,
    isLoading,
    error: null,
  } as never);
};

describe("MusicDetailDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDetail(detail());
  });

  it("shows the whole prompt, not the truncated card title", () => {
    render(<MusicDetailDialog generation={summary()} open onOpenChange={() => {}} />);

    // getByText matches on full textContent, so this fails if the dialog
    // reuses the card's `truncate` treatment or slices the string.
    expect(screen.getByText(LONG_PROMPT)).toBeDefined();
  });

  it("shows every line of the lyrics", () => {
    render(<MusicDetailDialog generation={summary()} open onOpenChange={() => {}} />);

    const lyrics = screen.getByTestId("music-detail-lyrics");
    expect(lyrics.textContent).toBe(LONG_LYRICS);
    expect(lyrics.textContent).toContain("[verse 12]");
  });

  it("offers a copy button for the prompt and another for the lyrics", () => {
    render(<MusicDetailDialog generation={summary()} open onOpenChange={() => {}} />);

    expect(screen.getByRole("button", { name: /copy prompt/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /copy lyrics/i })).toBeDefined();
  });

  it("reports the settings the generation actually ran with", () => {
    render(<MusicDetailDialog generation={summary()} open onOpenChange={() => {}} />);

    expect(screen.getByText("minimax/music-3")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
    expect(screen.getByText("1:00")).toBeDefined();
  });

  it("falls back to the card's own duration before the detail read lands", () => {
    mockDetail(undefined, true);

    render(<MusicDetailDialog generation={summary()} open onOpenChange={() => {}} />);

    // The summary is already in hand, so the dialog opens populated instead of
    // showing an empty shell while the seed is fetched.
    expect(screen.getByText(LONG_PROMPT)).toBeDefined();
    expect(screen.getByText("1:00")).toBeDefined();
  });

  it("says the seed is unavailable rather than rendering a blank or a zero", () => {
    mockDetail(detail({ seed: null }));

    render(<MusicDetailDialog generation={summary()} open onOpenChange={() => {}} />);

    expect(screen.getByTestId("music-detail-seed").textContent).toBe("Not available");
  });

  it("renders nothing while closed", () => {
    render(<MusicDetailDialog generation={summary()} open={false} onOpenChange={() => {}} />);

    expect(screen.queryByText(LONG_PROMPT)).toBeNull();
  });

  it("surfaces the failure reason for a failed generation", () => {
    const failed = summary({
      status: "failed",
      audio_url: null,
      error_message: "Lyrics structure tags were rejected.",
    });
    mockDetail(detail({ ...failed, seed: null }));

    render(<MusicDetailDialog generation={failed} open onOpenChange={() => {}} />);

    expect(screen.getByText("Lyrics structure tags were rejected.")).toBeDefined();
  });
});
