// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ArtistSocialsCard from "@/components/Onboarding/ArtistSocialsCard";
import type { ArtistRecord } from "@/types/Artist";

const artist = {
  account_id: "artist-1",
  name: "Drake",
  account_socials: [
    { id: "s1", link: "https://open.spotify.com/artist/abc", username: "drake" },
    { id: "s2", link: "https://instagram.com/champagnepapi", username: "champagnepapi" },
  ],
} as unknown as ArtistRecord;

const props = {
  artist,
  isFixing: false,
  onFix: vi.fn(),
  onRemove: vi.fn(),
};

describe("ArtistSocialsCard", () => {
  it("collapses an artist's socials by default so a multi-artist roster is traversable", () => {
    render(<ArtistSocialsCard {...props} />);

    // A manager with 10 artists had every artist's socials expanded at once,
    // making the step an unscannable wall (chat#1889).
    expect(screen.queryByLabelText(/edit spotify link/i)).toBeNull();
    expect(
      screen.getByRole("button", { name: /drake/i }),
    ).toHaveProperty("ariaExpanded", "false");
  });

  it("summarises how many profiles are inside while collapsed", () => {
    render(<ArtistSocialsCard {...props} />);

    expect(screen.getByText(/2 profiles/i)).toBeDefined();
  });

  it("expands on click to reveal the rows", () => {
    render(<ArtistSocialsCard {...props} />);
    fireEvent.click(screen.getByRole("button", { name: /drake/i }));

    expect(screen.getByLabelText(/edit spotify link/i)).toBeDefined();
  });

  it("starts open when it is the only artist, so a single-artist roster needs no click", () => {
    render(<ArtistSocialsCard {...props} defaultOpen />);

    expect(screen.getByLabelText(/edit spotify link/i)).toBeDefined();
  });
});
