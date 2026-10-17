import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/intelligent-ui/playground/audio/route";
import { createSectionStudyAudio } from "../createSectionStudyAudio";

afterEach(() => vi.unstubAllEnvs());

describe("original section-study audio", () => {
  it("contains real 48-second PCM audio rather than simulated playback data", () => {
    const bytes = createSectionStudyAudio();
    const header = new DataView(bytes.buffer);
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("RIFF");
    expect(new TextDecoder().decode(bytes.slice(8, 12))).toBe("WAVE");
    expect(header.getUint16(22, true)).toBe(1);
    expect(header.getUint16(34, true)).toBe(16);
    expect(header.getUint32(40, true) / header.getUint32(28, true)).toBe(48);
    const pcm = new Int16Array(bytes.buffer, 44);
    expect(pcm.some((value) => Math.abs(value) > 1000)).toBe(true);
    expect(Math.max(...pcm.slice(0, 20000))).toBeLessThan(32767);
  });

  it("denies production before creating or serving an asset", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("RECOUP_INTELLIGENT_UI_PLAYGROUND", "true");
    const result = GET(
      new Request("http://localhost/api/intelligent-ui/playground/audio"),
    );
    expect(result.status).toBe(404);
    expect(result.headers.get("Cache-Control")).toBe("no-store");
  });

  it("serves a seekable no-store asset with consistent byte ranges", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "");
    const full = GET(
      new Request("http://localhost/api/intelligent-ui/playground/audio"),
    );
    const bytes = new Uint8Array(await full.arrayBuffer());
    expect(full.headers.get("Content-Type")).toBe("audio/wav");
    expect(full.headers.get("Accept-Ranges")).toBe("bytes");
    for (const [range, start, end] of [
      ["bytes=44-99", 44, 99],
      ["bytes=-24", bytes.length - 24, bytes.length - 1],
      [`bytes=${bytes.length - 24}-`, bytes.length - 24, bytes.length - 1],
    ] as const) {
      const response = GET(
        new Request("http://localhost/api/intelligent-ui/playground/audio", {
          headers: { Range: range },
        }),
      );
      expect(response.status).toBe(206);
      expect(response.headers.get("Content-Range")).toBe(
        `bytes ${start}-${end}/${bytes.length}`,
      );
      expect(new Uint8Array(await response.arrayBuffer())).toEqual(
        bytes.slice(start, end + 1),
      );
    }
    for (const range of [
      "bytes=5-2",
      "bytes=-0",
      "bytes=-",
      "bytes=9000000-",
      "bytes=0-1,4-5",
      "garbage",
    ]) {
      expect(
        GET(
          new Request("http://localhost/api/intelligent-ui/playground/audio", {
            headers: { Range: range },
          }),
        ).status,
      ).toBe(416);
    }
  });
});
