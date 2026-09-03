import { describe, it, expect } from "vitest";
import { mediaDownloadFilename } from "@/lib/chat/mediaDownloadFilename";

describe("mediaDownloadFilename", () => {
  it("takes the last path segment", () => {
    expect(
      mediaDownloadFilename("https://cdn.example.com/files/abc/song.wav"),
    ).toBe("song.wav");
  });

  it("ignores a query string and hash", () => {
    expect(
      mediaDownloadFilename("https://cdn.example.com/a/clip.mp4?token=xyz#t=3"),
    ).toBe("clip.mp4");
  });

  it("falls back when the url has no usable segment", () => {
    expect(mediaDownloadFilename("https://cdn.example.com/")).toBe("download");
  });
});
