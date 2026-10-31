// @vitest-environment jsdom
import React from "react";
import { createControlledImage } from "./createControlledImage";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ArtistProfile } from "@/lib/supabase/artist/updateArtistProfile";
import ArtistHeroSection from "../ArtistHeroSection";
import UpdateArtistInfoSuccess from "../UpdateArtistInfoSuccess";
import UpdateArtistSocialsSuccess, {
  type UpdateArtistSocialsResult,
} from "../UpdateArtistSocialsSuccess";

const { context, getArtists, setSelectedArtist } = vi.hoisted(() => ({
  context: { selectedArtist: {} as ArtistProfile },
  getArtists: vi.fn(),
  setSelectedArtist: vi.fn(),
}));
vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ ...context, getArtists, setSelectedArtist }),
}));
const artist: ArtistProfile = {
  id: "synthetic-artist",
  account_id: "synthetic-artist",
  name: "Supplied artist",
  timestamp: null,
  image: "https://images.invalid/artist-a.jpg",
  instruction: "Supplied instructions",
  label: "Supplied label",
  organization: "Supplied organization",
  company_name: null,
  job_title: null,
  role_type: null,
  updated_at: "2026-10-01T00:00:00Z",
  knowledges: [
    {
      url: "https://files.invalid/brief.txt",
      name: "Brief",
      type: "text/plain",
    },
  ],
};
const replacement = {
  ...artist,
  id: "artist-b",
  name: "Next artist",
  image: "https://images.invalid/artist-b.jpg",
};
const loaders: HTMLImageElement[] = [];
let cached = false;
const denyNetwork = vi.fn(() => {
  throw new Error("Artist header tests forbid requests");
});
beforeEach(() => {
  cached = false;
  loaders.length = 0;
  getArtists.mockClear();
  setSelectedArtist.mockClear();
  denyNetwork.mockClear();
  context.selectedArtist = artist;
  for (const name of ["fetch", "XMLHttpRequest", "WebSocket"])
    vi.stubGlobal(name, denyNetwork);
  // Keep the real primitive while controlling pending, failure and cache hits.
  vi.stubGlobal("Image", vi.fn(createControlledImage(loaders, () => cached)));
});
afterEach(() => {
  try {
    cleanup();
    expect(denyNetwork).not.toHaveBeenCalled();
    expect(setSelectedArtist).not.toHaveBeenCalled();
  } finally {
    vi.unstubAllGlobals();
  }
});
function settle(
  container: HTMLElement,
  status: "load" | "error",
  src = artist.image!,
) {
  const image =
    loaders.filter((x) => x.src === src).at(-1) ??
    Array.from(container.querySelectorAll("img")).find((x) => x.src === src);
  if (!image) throw new Error(`No synthetic image for ${src}`);
  fireEvent[status](image);
  return image;
}
function expectFallback(container: HTMLElement, name = artist.name!) {
  const fallback = screen.getByRole("img", { name });
  expect(fallback.tagName).not.toBe("IMG");
  expect(fallback.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
  expect(container.querySelector("img")).toBeNull();
  expect(
    container.querySelector("button,input,[tabindex],[role=alert],[aria-live]"),
  ).toBeNull();
  return fallback;
}
function expectText(container: HTMLElement) {
  expect(screen.getByRole("heading", { name: artist.name! }).tagName).toBe(
    "H1",
  );
  expect(screen.getByText("Profile Updated Successfully!")).toBeTruthy();
  expect(screen.getByText(artist.label!)).toBeTruthy();
  expect(container.textContent).toContain("Updated");
  expect(container.querySelector("[style]")?.getAttribute("style")).toContain(
    artist.image!,
  );
}
describe("artist header resource lifecycle", () => {
  it("shows a named neutral fallback while pending", () => {
    const { container } = render(<ArtistHeroSection artistProfile={artist} />);
    expectFallback(container);
    expectText(container);
  });
  it("preserves loaded URL, name, crop and responsive dimensions", () => {
    const { container } = render(<ArtistHeroSection artistProfile={artist} />);
    settle(container, "load");
    const image = screen.getByRole("img", { name: artist.name! });
    expect(image.getAttribute("src")).toBe(artist.image);
    expect(image.classList.contains("object-cover")).toBe(true);
    for (const token of [
      "w-24",
      "h-24",
      "sm:w-32",
      "sm:h-32",
      "rounded-lg",
      "shadow-2xl",
    ])
      expect(
        (image.parentElement!.className + " " + image.className).split(" "),
      ).toContain(token);
    expectText(container);
  });
  it("replaces a failed image without changing header text", () => {
    const { container } = render(<ArtistHeroSection artistProfile={artist} />);
    const before = container.textContent;
    settle(container, "error");
    expectFallback(container);
    expectText(container);
    expect(container.textContent).toBe(before);
  });
  it("shows a cached image without a second load event", () => {
    cached = true;
    render(<ArtistHeroSection artistProfile={artist} />);
    expect(
      screen.getByRole("img", { name: artist.name! }).getAttribute("src"),
    ).toBe(artist.image);
  });
  it("recovers with a replacement URL after failure", () => {
    const { container, rerender } = render(
      <ArtistHeroSection artistProfile={artist} />,
    );
    settle(container, "error");
    expectFallback(container);
    rerender(<ArtistHeroSection artistProfile={replacement} />);
    expectFallback(container, replacement.name!);
    settle(container, "load", replacement.image!);
    expect(
      screen.getByRole("img", { name: replacement.name! }).getAttribute("src"),
    ).toBe(replacement.image);
  });
  it("does not retain a loaded image while its replacement is pending", () => {
    const { container, rerender } = render(
      <ArtistHeroSection artistProfile={artist} />,
    );
    settle(container, "load");
    rerender(<ArtistHeroSection artistProfile={replacement} />);
    expectFallback(container, replacement.name!);
    settle(container, "load", replacement.image!);
    expect(
      screen.getByRole("img", { name: replacement.name! }).getAttribute("src"),
    ).toBe(replacement.image);
  });
  it("ignores an old resource completing after a URL change", () => {
    const { container, rerender } = render(
      <ArtistHeroSection artistProfile={artist} />,
    );
    const old = loaders.at(-1) ?? container.querySelector("img")!;
    rerender(<ArtistHeroSection artistProfile={replacement} />);
    fireEvent.load(old);
    expectFallback(container, replacement.name!);
    settle(container, "load", replacement.image!);
    fireEvent.error(old);
    expect(
      screen.getByRole("img", { name: replacement.name! }).getAttribute("src"),
    ).toBe(replacement.image);
  });
  it("keeps resource failures local to each header", () => {
    const { container } = render(
      <>
        <ArtistHeroSection artistProfile={artist} />
        <ArtistHeroSection artistProfile={replacement} />
      </>,
    );
    settle(container, "load", replacement.image!);
    settle(container, "error");
    expect(screen.getByRole("img", { name: artist.name! }).tagName).not.toBe(
      "IMG",
    );
    expect(
      screen.getByRole("img", { name: replacement.name! }).getAttribute("src"),
    ).toBe(replacement.image);
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });
  it("keeps the current default alt label for a missing name", () => {
    const { container } = render(
      <ArtistHeroSection artistProfile={{ ...artist, name: null }} />,
    );
    settle(container, "error");
    expectFallback(container, "Artist");
  });
  it.each([null, ""])("keeps the absent-avatar path for image %j", (image) => {
    const { container } = render(
      <ArtistHeroSection artistProfile={{ ...artist, image }} />,
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("[style]")).toBeNull();
    expect(screen.getByText("Profile Updated Successfully!")).toBeTruthy();
  });
  it("removes the avatar when its URL is cleared", () => {
    const { container, rerender } = render(
      <ArtistHeroSection artistProfile={artist} />,
    );
    settle(container, "load");
    rerender(<ArtistHeroSection artistProfile={{ ...artist, image: null }} />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(container.querySelector("[style]")).toBeNull();
  });
  it("keeps supplied message and new name across resource failure", () => {
    const { container, rerender } = render(
      <ArtistHeroSection
        artistProfile={artist}
        message="Supplied confirmation <unchanged>"
      />,
    );
    settle(container, "error");
    expectFallback(container);
    rerender(
      <ArtistHeroSection
        artistProfile={{ ...artist, name: "Renamed artist" }}
        message="Supplied confirmation <unchanged>"
      />,
    );
    expectFallback(container, "Renamed artist");
    expect(
      screen.getAllByText("Supplied confirmation <unchanged>"),
    ).toHaveLength(1);
  });
});
describe("real result parents", () => {
  it("preserves profile content and prose through image failure", () => {
    const { container } = render(
      <>
        <p>Conversation before.</p>
        <UpdateArtistInfoSuccess
          result={{
            success: true,
            message: "Supplied confirmation",
            artistProfile: artist,
          }}
        />
        <p>Conversation after.</p>
      </>,
    );
    settle(container, "error");
    expectFallback(container);
    for (const text of [
      "Conversation before.",
      "Conversation after.",
      artist.instruction!,
      artist.organization!,
      "Brief",
    ])
      expect(screen.getByText(text)).toBeTruthy();
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "https://files.invalid/brief.txt",
    );
    expect(getArtists).toHaveBeenCalledTimes(1);
  });
  it("preserves social results, confirmation and prose through image failure", () => {
    const socials: NonNullable<UpdateArtistSocialsResult["socials"]> = [
      "https://instagram.com/synthetic.one",
      "youtube.com/@synthetic.two",
    ].map((profile_url, index) => ({
      id: `rel-${index}`,
      account_id: artist.account_id,
      social_id: `social-${index}`,
      social: {
        id: `social-${index}`,
        profile_url,
        username: `synthetic-${index}`,
        avatar: null,
        bio: null,
        followerCount: null,
        followingCount: null,
        region: null,
        updated_at: "2026-10-01T00:00:00Z",
      },
    }));
    const { container } = render(
      <>
        <p>Conversation before.</p>
        <UpdateArtistSocialsSuccess
          result={{ success: true, message: "Links saved.", socials }}
        />
        <p>Conversation after.</p>
      </>,
    );
    settle(container, "error");
    expectFallback(container);
    expect(screen.getAllByText("Links saved.")).toHaveLength(1);
    expect(screen.getByText("Conversation before.")).toBeTruthy();
    expect(screen.getByText("Conversation after.")).toBeTruthy();
    expect(
      Array.from(container.querySelectorAll("a")).map((x) => [
        x.textContent?.includes("synthetic"),
        x.getAttribute("href"),
        x.getAttribute("target"),
        x.getAttribute("rel"),
      ]),
    ).toEqual([
      [
        true,
        "https://instagram.com/synthetic.one",
        "_blank",
        "noopener noreferrer",
      ],
      [
        true,
        "https://youtube.com/@synthetic.two",
        "_blank",
        "noopener noreferrer",
      ],
    ]);
    expect(getArtists).toHaveBeenCalledTimes(1);
  });
});
