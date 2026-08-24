// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SongDetail from "@/components/SongPage/SongDetail";
import useMusicGeneration from "@/hooks/useMusicGeneration";
import { MusicGenerationRequestError } from "@/lib/music/getMusicGeneration";
import type { MusicGenerationDetail } from "@/types/Music";

vi.mock("@/hooks/useMusicGeneration", () => ({ default: vi.fn() }));

const ID = "11111111-2222-4333-8444-555555555555";

const detail = (over: Partial<MusicGenerationDetail> = {}): MusicGenerationDetail => ({
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
    mock({ data: { status: "success", generation: detail() }, isLoading: false, error: null });

    render(<SongDetail generationId={ID} />);

    expect(screen.getByText("Genre: lo-fi soul. BPM: 82.")).toBeDefined();
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
    mock({ data: undefined, isLoading: false, error: new MusicGenerationRequestError(403, "no") });

    render(<SongDetail generationId={ID} />);

    expect(screen.getByTestId("song-no-access")).toBeDefined();
    expect(screen.queryByTestId("song-error")).toBeNull();
  });

  it("distinguishes a missing song from one you cannot see", () => {
    mock({ data: undefined, isLoading: false, error: new MusicGenerationRequestError(404, "no") });

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

    expect(screen.getByText("Lyrics structure tags were rejected.")).toBeDefined();
  });
});
