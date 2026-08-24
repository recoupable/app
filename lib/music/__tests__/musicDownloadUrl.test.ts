import { describe, expect, it } from "vitest";
import { musicDownloadUrl, musicDownloadFilename } from "@/lib/music/musicDownloadUrl";

const AUDIO =
  "https://proj.supabase.co/storage/v1/object/public/public-uploads/music/abc-123.wav";

describe("musicDownloadFilename", () => {
  it("names the file after the prompt so a saved song is recognisable", () => {
    expect(musicDownloadFilename("Genre: dream pop. BPM: 104.", AUDIO)).toBe(
      "genre-dream-pop-bpm-104.wav",
    );
  });

  it("keeps the extension of the stored object", () => {
    expect(musicDownloadFilename("song", "https://x/y/abc.mp3")).toBe("song.mp3");
  });

  it("falls back to wav when the url carries no extension", () => {
    expect(musicDownloadFilename("song", "https://x/y/abc")).toBe("song.wav");
  });

  it("truncates a long prompt rather than producing an unusable filename", () => {
    const name = musicDownloadFilename("word ".repeat(60), AUDIO);
    expect(name.length).toBeLessThanOrEqual(64);
    expect(name.endsWith(".wav")).toBe(true);
  });

  it("never yields a bare extension when the prompt has nothing usable", () => {
    expect(musicDownloadFilename("!!! ???", AUDIO)).toBe("generated-song.wav");
  });
});

describe("musicDownloadUrl", () => {
  it("asks storage for an attachment, which is what makes a cross-origin download work", () => {
    const url = musicDownloadUrl(AUDIO, "my-song.wav");

    expect(url).toContain("download=my-song.wav");
    expect(url?.startsWith(AUDIO)).toBe(true);
  });

  it("appends to an href that already carries a query", () => {
    const url = musicDownloadUrl(`${AUDIO}?token=abc`, "my-song.wav") as string;

    expect(url).toContain("token=abc");
    expect(url).toContain("download=my-song.wav");
    expect(url.split("?").length).toBe(2);
  });

  it("encodes a filename with characters that would break the query", () => {
    expect(musicDownloadUrl(AUDIO, "a b&c.wav")).toContain("download=a%20b%26c.wav");
  });

  it("returns null when there is nothing to download", () => {
    expect(musicDownloadUrl(null, "x.wav")).toBeNull();
  });
});
