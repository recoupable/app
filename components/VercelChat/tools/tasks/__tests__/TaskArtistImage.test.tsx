// @vitest-environment jsdom
import React from "react";
import { createControlledImage } from "../../__tests__/createControlledImage";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TaskArtistImage from "../TaskArtistImage";
import useArtistImage from "@/hooks/useArtistImage";
import { forbidTaskNetwork } from "./forbidTaskNetwork";

vi.mock("@/hooks/useArtistImage", () => ({ default: vi.fn() }));

const artist = {
  imageUrl: "https://images.invalid/artist-a.jpg",
  artistName: "Artist A",
};
const replacement = {
  imageUrl: "https://images.invalid/artist-b.jpg",
  artistName: "Artist B",
};
const loaders: HTMLImageElement[] = [];
let cached = false;

forbidTaskNetwork();

beforeEach(() => {
  cached = false;
  loaders.length = 0;
  vi.mocked(useArtistImage).mockReset().mockReturnValue(artist);
  // Exercise the real avatar with inert image requests, including cache hits.
  vi.stubGlobal("Image", vi.fn(createControlledImage(loaders, () => cached)));
});

function settleImage(
  container: HTMLElement,
  status: "load" | "error",
  src = artist.imageUrl,
) {
  const image =
    loaders.filter((loader) => loader.src === src).at(-1) ??
    Array.from(container.querySelectorAll("img")).find(
      (image) => image.src === src,
    );
  if (!image) throw new Error(`No image request for ${src}`);
  fireEvent[status](image);
}

function expectFallback(container: HTMLElement, name: string) {
  expect(container.querySelector("img")).toBeNull();
  expect(screen.getByRole("img", { name })).toBeTruthy();
  expect(container.querySelector("svg")).toBeTruthy();
  expect(container.querySelector("a, button, input, [tabindex]")).toBeNull();
}

describe("TaskArtistImage resource lifecycle", () => {
  it.each([null, ""])(
    "keeps the neutral fallback for missing URL %j",
    (imageUrl) => {
      vi.mocked(useArtistImage).mockReturnValue({ ...artist, imageUrl });
      const { container } = render(
        <TaskArtistImage artistAccountId="artist-a" />,
      );
      expectFallback(container, "Artist A");
      expect(useArtistImage).toHaveBeenCalledWith("artist-a");
    },
  );

  it("retains an accessible default when artist identity is unavailable", () => {
    vi.mocked(useArtistImage).mockReturnValue({
      imageUrl: null,
      artistName: null,
    });
    const { container } = render(<TaskArtistImage />);
    expectFallback(container, "Artist avatar");
  });

  it.each(["", " \n "])(
    "names the fallback when the artist name is blank %j",
    (artistName) => {
      vi.mocked(useArtistImage).mockReturnValue({ imageUrl: null, artistName });
      const { container } = render(<TaskArtistImage />);
      expectFallback(container, "Artist avatar");
    },
  );

  it("names a loaded image when the artist name is blank", () => {
    vi.mocked(useArtistImage).mockReturnValue({ ...artist, artistName: " " });
    const { container } = render(<TaskArtistImage />);
    settleImage(container, "load");
    expect(
      screen.getByRole("img", { name: "Artist avatar" }).getAttribute("src"),
    ).toBe(artist.imageUrl);
  });

  it("shows the named fallback while an image is pending", () => {
    const { container } = render(
      <TaskArtistImage artistAccountId="artist-a" />,
    );
    expectFallback(container, "Artist A");
  });

  it("preserves a successfully loaded URL, artist name and image fit", () => {
    const { container } = render(
      <TaskArtistImage artistAccountId="artist-a" />,
    );
    settleImage(container, "load");
    const image = screen.getByRole("img", { name: "Artist A" });
    expect(image.getAttribute("src")).toBe(artist.imageUrl);
    expect(image.classList.contains("object-cover")).toBe(true);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("replaces a failed image with the existing quiet fallback", () => {
    const { container } = render(
      <TaskArtistImage artistAccountId="artist-a" />,
    );
    settleImage(container, "error");
    expectFallback(container, "Artist A");
  });

  it("recovers when a new artist URL arrives after failure", () => {
    const { container, rerender } = render(
      <TaskArtistImage artistAccountId="artist-a" />,
    );
    settleImage(container, "error");
    expectFallback(container, "Artist A");
    vi.mocked(useArtistImage).mockReturnValue(replacement);
    rerender(<TaskArtistImage artistAccountId="artist-b" />);
    expectFallback(container, "Artist B");
    settleImage(container, "load", replacement.imageUrl);
    expect(
      screen.getByRole("img", { name: "Artist B" }).getAttribute("src"),
    ).toBe(replacement.imageUrl);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("does not retain a previous image while its replacement is pending", () => {
    const { container, rerender } = render(
      <TaskArtistImage artistAccountId="artist-a" />,
    );
    settleImage(container, "load");
    vi.mocked(useArtistImage).mockReturnValue(replacement);
    rerender(<TaskArtistImage artistAccountId="artist-b" />);
    expectFallback(container, "Artist B");
    settleImage(container, "load", replacement.imageUrl);
    expect(
      screen.getByRole("img", { name: "Artist B" }).getAttribute("src"),
    ).toBe(replacement.imageUrl);
  });

  it("keeps failures local to the corresponding task image", () => {
    vi.mocked(useArtistImage).mockImplementation((id) =>
      id === "artist-a" ? artist : replacement,
    );
    const { container } = render(
      <>
        <TaskArtistImage artistAccountId="artist-a" />
        <TaskArtistImage artistAccountId="artist-b" />
      </>,
    );
    settleImage(container, "load", replacement.imageUrl);
    settleImage(container, "error");
    expect(screen.getByRole("img", { name: "Artist A" })).toBeTruthy();
    expect(
      screen.getByRole("img", { name: "Artist B" }).getAttribute("src"),
    ).toBe(replacement.imageUrl);
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("shows a cached image without waiting for a second load event", () => {
    cached = true;
    const { container } = render(
      <TaskArtistImage artistAccountId="artist-a" />,
    );
    expect(
      screen.getByRole("img", { name: "Artist A" }).getAttribute("src"),
    ).toBe(artist.imageUrl);
    expect(container.querySelector("svg")).toBeNull();
  });

  it("returns to the named fallback when the image URL is removed", () => {
    const { container, rerender } = render(
      <TaskArtistImage artistAccountId="artist-a" />,
    );
    settleImage(container, "load");
    vi.mocked(useArtistImage).mockReturnValue({ ...artist, imageUrl: null });
    rerender(<TaskArtistImage artistAccountId="artist-a" />);
    expectFallback(container, "Artist A");
  });
});
