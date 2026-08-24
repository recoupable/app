// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MusicGenerationCard from "@/components/MusicPage/MusicGenerationCard";
import useMusicGeneration from "@/hooks/useMusicGeneration";
import type { MusicGeneration } from "@/types/Music";

vi.mock("@/hooks/useMusicGeneration", () => ({ default: vi.fn() }));

const generation = (over: Partial<MusicGeneration> = {}): MusicGeneration => ({
  id: "11111111-2222-4333-8444-555555555555",
  status: "completed",
  prompt: "Genre: acoustic pop.",
  lyrics: "[verse]\nMorning light",
  model: "minimax/music-3",
  duration_seconds: 60,
  audio_url: "https://cdn.example/music/abc.wav",
  error_message: null,
  created_at: "2026-08-21T12:00:00.000Z",
  updated_at: "2026-08-21T12:00:00.000Z",
  ...over,
});

describe("MusicGenerationCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMusicGeneration).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as never);
  });

  it("offers a download beside a completed song", () => {
    render(<MusicGenerationCard generation={generation()} />);

    const download = screen.getByRole("link", { name: /download genre: acoustic pop/i });
    expect(download.hasAttribute("download")).toBe(true);
  });

  // The download attribute alone shipped broken: browsers ignore it
  // cross-origin, and our audio is on Supabase while the app is not, so the
  // link navigated the tab to a bare audio file. Asserting the attribute
  // exists is what let that through, so assert the url does the work.
  it("asks storage for an attachment so the download survives being cross-origin", () => {
    render(<MusicGenerationCard generation={generation()} />);

    const href = screen
      .getByRole("link", { name: /download genre: acoustic pop/i })
      .getAttribute("href") as string;

    expect(href).toContain("download=");
    expect(href.startsWith("https://cdn.example/music/abc.wav")).toBe(true);
  });

  it("saves under a name taken from the prompt, not the generation id", () => {
    render(<MusicGenerationCard generation={generation()} />);

    const href = screen
      .getByRole("link", { name: /download genre: acoustic pop/i })
      .getAttribute("href") as string;

    expect(href).toContain("download=genre-acoustic-pop.wav");
  });

  it("offers no download while a song is still generating", () => {
    render(
      <MusicGenerationCard
        generation={generation({ status: "processing", audio_url: null })}
      />,
    );

    expect(screen.queryByRole("link", { name: /download/i })).toBeNull();
    expect(screen.getByText(/1 to 2 minutes/i)).toBeDefined();
  });

  it("shows the failure reason verbatim rather than a generic message", () => {
    render(
      <MusicGenerationCard
        generation={generation({
          status: "failed",
          audio_url: null,
          error_message: "Lyrics structure tags were rejected.",
        })}
      />,
    );

    expect(screen.getByText("Lyrics structure tags were rejected.")).toBeDefined();
    expect(screen.queryByRole("link", { name: /download/i })).toBeNull();
  });

  it("identifies a song by its prompt, which is what the API returns", () => {
    render(<MusicGenerationCard generation={generation()} />);

    expect(screen.getByText("Genre: acoustic pop.")).toBeDefined();
  });

  it("opens the detail dialog when the song is clicked", () => {
    render(<MusicGenerationCard generation={generation()} />);

    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /view details/i }));

    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("does not open the dialog when the download is clicked", () => {
    // The download and the player sit inside the clickable card. Without
    // stopping propagation, saving a song would also pop the dialog open.
    render(<MusicGenerationCard generation={generation()} />);

    fireEvent.click(screen.getByRole("link", { name: /download/i }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not open the dialog when the audio player is clicked", () => {
    const { container } = render(<MusicGenerationCard generation={generation()} />);

    const audio = container.querySelector("audio");
    expect(audio).not.toBeNull();
    fireEvent.click(audio as Element);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the dialog for a failed song too, so the reason can be read in full", () => {
    render(
      <MusicGenerationCard
        generation={generation({
          status: "failed",
          audio_url: null,
          error_message: "Lyrics structure tags were rejected.",
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /view details/i }));

    expect(screen.getByRole("dialog")).toBeDefined();
  });
});
