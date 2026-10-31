// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ArtistRecord } from "@/types/Artist";
import UpdateArtistSocialsSuccess, {
  type UpdateArtistSocialsResult,
} from "../UpdateArtistSocialsSuccess";

const { context, getArtists, setSelectedArtist } = vi.hoisted(() => ({
  context: { selectedArtist: null as ArtistRecord | null },
  getArtists: vi.fn(),
  setSelectedArtist: vi.fn(),
}));

vi.mock("@/providers/ArtistProvider", () => ({
  useArtistProvider: () => ({ ...context, getArtists, setSelectedArtist }),
}));

const artist: ArtistRecord = {
  account_id: "synthetic-artist",
  name: "Context artist",
  image: null,
  label: "Example label",
};
const socials: NonNullable<UpdateArtistSocialsResult["socials"]> = [
  "https://instagram.com/synthetic.one",
  "youtube.com/@synthetic.two",
].map((profile_url, index) => ({
  id: `relationship-${index}`,
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
    updated_at: "2026-10-01T00:00:00.000Z",
  },
}));
const request = vi.fn(() => {
  throw new Error("Social result tests must not make requests");
});

beforeEach(() => {
  context.selectedArtist = null;
  getArtists.mockClear();
  setSelectedArtist.mockClear();
  request.mockClear();
  vi.stubGlobal("fetch", request);
  vi.stubGlobal("XMLHttpRequest", request);
  vi.stubGlobal("WebSocket", request);
});

afterEach(() => {
  cleanup();
  expect(request).not.toHaveBeenCalled();
  expect(setSelectedArtist).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

const cases = [
  {
    name: "success with links and no selection",
    selected: false,
    success: true,
    message: "Saved the supplied links.",
    socials,
    expected: "Saved the supplied links.",
    header: false,
  },
  {
    name: "success with an empty list and no selection",
    selected: false,
    success: true,
    message: "Update completed.",
    socials: [],
    expected: "Update completed.",
    header: false,
  },
  {
    name: "success with omitted rows and no selection",
    selected: false,
    success: true,
    message: "Update completed.",
    expected: "Update completed.",
    header: false,
  },
  {
    name: "blank success message with no selection",
    selected: false,
    success: true,
    message: "",
    socials,
    expected: "Artist socials updated successfully.",
    header: false,
  },
  {
    name: "selected successful artist and links",
    selected: true,
    success: true,
    message: "Saved the supplied links.",
    socials,
    expected: "Saved the supplied links.",
    header: true,
  },
  {
    name: "selected successful artist with default message",
    selected: true,
    success: true,
    message: "",
    socials,
    expected: "Artist socials updated successfully.",
    header: true,
  },
  {
    name: "selected successful artist with an empty list",
    selected: true,
    success: true,
    message: "Update completed.",
    socials: [],
    expected: "Update completed.",
    header: true,
  },
  {
    name: "error without selection",
    selected: false,
    success: false,
    message: "The update failed.",
    expected: "The update failed.",
    header: false,
  },
  {
    name: "error with a selected artist",
    selected: true,
    success: false,
    message: "The update failed.",
    expected: "The update failed.",
    header: false,
  },
  {
    name: "blank error without selection",
    selected: false,
    success: false,
    message: "",
    expected: "Failed to update artist socials.",
    header: false,
  },
  {
    name: "blank error with a selected artist",
    selected: true,
    success: false,
    message: "",
    expected: "Failed to update artist socials.",
    header: false,
  },
];

describe("Social update result selection and outcome", () => {
  it.each(cases)("renders $name truthfully", (value) => {
    context.selectedArtist = value.selected ? artist : null;
    const result: UpdateArtistSocialsResult = {
      success: value.success,
      message: value.message,
      socials: value.socials,
    };
    const { container } = render(
      <UpdateArtistSocialsSuccess result={result} />,
    );

    expect(screen.getAllByText(value.expected).length).toBe(1);
    if (value.header) {
      expect(
        screen.getByRole("heading", { name: "Context artist" }),
      ).not.toBeNull();
      expect(screen.getByText("Example label")).not.toBeNull();
      expect(container.querySelector("svg.text-green-500")).not.toBeNull();
    } else {
      expect(screen.queryByRole("heading")).toBeNull();
      expect(screen.queryByRole("img")).toBeNull();
      expect(container.querySelector("svg.text-green-500")).toBeNull();
    }
    const links = screen.queryAllByRole("link");
    expect(links.length).toBe(value.socials?.length ?? 0);
    for (const [index, link] of links.entries()) {
      expect(link.textContent).toContain(
        value.socials![index].social.profile_url,
      );
      expect(link.getAttribute("href")).toBe(
        index === 0
          ? "https://instagram.com/synthetic.one"
          : "https://youtube.com/@synthetic.two",
      );
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector('[role="alert"], [aria-live]')).toBeNull();
    expect(getArtists).toHaveBeenCalledTimes(1);
  });

  it("tracks selection and outcome rerenders without changing selection or refreshing again", () => {
    const success: UpdateArtistSocialsResult = {
      success: true,
      message: "Saved the supplied links.",
      socials,
    };
    const failure: UpdateArtistSocialsResult = {
      success: false,
      message: "The update failed.",
    };
    const { rerender } = render(
      <UpdateArtistSocialsSuccess result={success} />,
    );
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getAllByRole("link").length).toBe(2);

    context.selectedArtist = artist;
    rerender(<UpdateArtistSocialsSuccess result={success} />);
    expect(
      screen.getByRole("heading", { name: "Context artist" }),
    ).not.toBeNull();
    rerender(<UpdateArtistSocialsSuccess result={failure} />);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getAllByText("The update failed.").length).toBe(1);

    context.selectedArtist = null;
    rerender(<UpdateArtistSocialsSuccess result={failure} />);
    expect(screen.queryByRole("heading")).toBeNull();
    rerender(<UpdateArtistSocialsSuccess result={success} />);
    expect(screen.getAllByText("Saved the supplied links.").length).toBe(1);
    expect(screen.getAllByRole("link").length).toBe(2);
    expect(getArtists).toHaveBeenCalledTimes(1);
  });
});
