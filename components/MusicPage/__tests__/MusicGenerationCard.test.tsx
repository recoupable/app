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
  title: "Midnight Interstate",
  model: "minimax/music-3",
  duration_seconds: 60,
  seed: 42,
  num_inference_steps: 30,
  guidance_scale: 1.7,
  audio_url: "https://cdn.example/music/abc.wav",
  mime_type: "audio/wav",
  file_size_bytes: 100,
  organization_id: null,
  error_message: null,
  created_at: "2026-08-21T12:00:00.000Z",
  updated_at: "2026-08-21T12:00:00.000Z",
  ...over,
});

describe("MusicGenerationCard", () => {
  it("offers a download beside a completed song", () => {
    render(<MusicGenerationCard generation={generation()} />);

    const download = screen.getByRole("link", { name: /download midnight interstate/i });
    expect(download.getAttribute("href")).toBe("https://cdn.example/music/abc.wav");
    expect(download.hasAttribute("download")).toBe(true);
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

  it("falls back to the prompt when a generation has no title", () => {
    render(<MusicGenerationCard generation={generation({ title: null })} />);

    expect(screen.getByText("Genre: acoustic pop.")).toBeDefined();
  });
});
