// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import MusicGenerationCard from "@/components/MusicPage/MusicGenerationCard";
import useMusicGeneration from "@/hooks/useMusicGeneration";
import type { MusicGeneration } from "@/types/Music";

vi.mock("@/hooks/useMusicGeneration", () => ({ default: vi.fn() }));

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

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
    push.mockClear();
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

  it("links the title to the song's own URL", () => {
    render(<MusicGenerationCard generation={generation()} />);

    const link = screen.getByRole("link", { name: /view details/i });
    expect(link.getAttribute("href")).toBe(`/music/${generation().id}`);
  });

  it("navigates to the song when the card is clicked", () => {
    const { container } = render(<MusicGenerationCard generation={generation()} />);

    fireEvent.click(container.querySelector("div.cursor-pointer") as Element);

    expect(push).toHaveBeenCalledWith(`/music/${generation().id}`);
  });

  it("does not navigate when the download is clicked", () => {
    // The download and the player sit inside the clickable card. Without
    // stopping propagation, saving a song would also navigate away from the
    // gallery.
    render(<MusicGenerationCard generation={generation()} />);

    fireEvent.click(screen.getByRole("link", { name: /download/i }));

    expect(push).not.toHaveBeenCalled();
  });

  it("does not navigate when the audio player is clicked", () => {
    const { container } = render(<MusicGenerationCard generation={generation()} />);

    fireEvent.click(container.querySelector("audio") as Element);

    expect(push).not.toHaveBeenCalled();
  });

  it("keeps the download an anchor outside the title link", () => {
    // Nesting anchors is invalid HTML, which is why the link wraps the title
    // rather than the whole card.
    render(<MusicGenerationCard generation={generation()} />);

    const download = screen.getByRole("link", { name: /download/i });
    expect(download.closest("a[href^='/music/']")).toBeNull();
  });
});
