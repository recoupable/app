// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MusicGenerationCard from "@/components/MusicPage/MusicGenerationCard";
import type { MusicGeneration } from "@/types/Music";

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
});
