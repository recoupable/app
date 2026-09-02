import { describe, expect, it } from "vitest";
import { extractMediaFromStdout } from "@/lib/chat/extractMediaFromStdout";

describe("extractMediaFromStdout", () => {
  it("finds the audio url a music poll returns", () => {
    const stdout = JSON.stringify({
      status: "success",
      generation: { id: "g1", status: "complete", audio_url: "https://cdn.example.com/song.mp3" },
    });
    expect(extractMediaFromStdout(stdout)).toEqual({
      url: "https://cdn.example.com/song.mp3",
      kind: "audio",
    });
  });

  it("finds a video url nested in a run output", () => {
    const stdout = JSON.stringify({
      runs: [{ output: { videoSourceUrl: "https://cdn.example.com/clip.mp4" } }],
    });
    expect(extractMediaFromStdout(stdout)?.kind).toBe("video");
  });

  it("classifies images", () => {
    expect(
      extractMediaFromStdout(JSON.stringify({ imageUrl: "https://cdn.example.com/still.png" }))?.kind,
    ).toBe("image");
  });

  it("ignores a query string when classifying", () => {
    expect(
      extractMediaFromStdout(
        JSON.stringify({ audio_url: "https://cdn.example.com/song.wav?e=1&s=abc" }),
      )?.kind,
    ).toBe("audio");
  });

  // A scraped third-party URL the agent echoed must never become a player.
  it("ignores urls that are not in a known media field", () => {
    expect(
      extractMediaFromStdout(JSON.stringify({ someOtherField: "https://evil.example.com/x.mp4" })),
    ).toBeNull();
  });

  it("ignores non-JSON stdout", () => {
    expect(extractMediaFromStdout("README.md\npackage.json")).toBeNull();
    expect(extractMediaFromStdout("")).toBeNull();
    expect(extractMediaFromStdout(undefined)).toBeNull();
  });

  it("ignores a known field holding a non-media extension", () => {
    expect(extractMediaFromStdout(JSON.stringify({ videoUrl: "https://x.example.com/page.html" }))).toBeNull();
  });

  it("ignores a relative or non-http value", () => {
    expect(extractMediaFromStdout(JSON.stringify({ audio_url: "/local/song.mp3" }))).toBeNull();
  });
});
