import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { videoClips } from "../videoClips";
import { videoFixtures } from "../videoFixtures";
import { resolveCreativeAsset } from "../resolveCreativeAsset";
import { readVideoFixture } from "../readVideoFixture";
import * as reader from "../readVideoFixture";
import { GET } from "@/app/api/intelligent-ui/playground/video-clips/[revision]/route";
vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual, open: vi.fn(actual.open) };
});
const clips = Object.values(videoClips);
const request = (revision: string, range?: string) =>
  GET(
    new Request(
      `http://localhost/api/intelligent-ui/playground/video-clips/${revision}`,
      { headers: range ? { Range: range } : {} },
    ),
    { params: Promise.resolve({ revision }) },
  );
beforeEach(async () => {
  const actual =
    await vi.importActual<typeof import("node:fs/promises")>(
      "node:fs/promises",
    );
  vi.mocked(fs.open).mockReset().mockImplementation(actual.open);
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
it("serves only pinned complete MP4 files from outside public, including Range requests", async () => {
  for (const [index, clip] of clips.entries()) {
    const response = await request(clip.version, "bytes=0-43");
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(response.status).toBe(200);
    expect(bytes.length).toBe(clip.bytes);
    expect(bytes.length).toBeLessThan(65536);
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(clip.version);
    expect(
      Buffer.from(bytes).equals(
        readFileSync(
          join(
            process.cwd(),
            "lib/intelligent-ui/playground/creative/fixtures/video",
            clip.file,
          ),
        ),
      ),
    ).toBe(true);
    expect(response.headers.get("Content-Type")).toBe("video/mp4");
    expect(response.headers.get("Content-Length")).toBe(String(clip.bytes));
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Content-Range")).toBeNull();
    expect(response.headers.get("Accept-Ranges")).toBeNull();
    expect(resolveCreativeAsset(videoFixtures[index])).toBe(
      `/api/intelligent-ui/playground/video-clips/${clip.version}`,
    );
    expect(
      resolveCreativeAsset({
        ...videoFixtures[index],
        preview: "light-wordmark",
      }),
    ).toBeUndefined();
  }
});
it.each([
  ["NODE_ENV", "production"],
  ["VERCEL_ENV", "production"],
  ["NEXT_PUBLIC_VERCEL_ENV", "production"],
  ["NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false"],
])("denies %s=%s before reading media", async (key, value) => {
  const spy = vi.spyOn(reader, "readVideoFixture");
  vi.stubEnv(key, value);
  const response = await request(clips[0].version);
  expect(response.status).toBe(404);
  expect((await response.arrayBuffer()).byteLength).toBe(0);
  expect(spy).not.toHaveBeenCalled();
});
it("refuses unknown revisions and path-like input before any file access", async () => {
  const spy = vi.mocked(fs.open);
  for (const value of [
    "0".repeat(64),
    "../../file",
    clips[0].version.toUpperCase(),
  ]) {
    expect((await request(value)).status).toBe(404);
    expect(await readVideoFixture(value)).toBeUndefined();
  }
  expect(spy).not.toHaveBeenCalled();
});
it.each(["size", "corrupt", "header", "short", "growth"])(
  "refuses %s media and closes the bounded file handle",
  async (fault) => {
    const clip = clips[0];
    const data = Buffer.from(
      readFileSync(
        join(
          process.cwd(),
          "lib/intelligent-ui/playground/creative/fixtures/video",
          clip.file,
        ),
      ),
    );
    if (fault === "corrupt") data[100] ^= 1;
    if (fault === "header") data[4] = 0;
    const close = vi.fn(async () => undefined);
    const read = vi.fn(async (target: Uint8Array) => {
      target.set(data);
      return {
        bytesRead:
          fault === "short"
            ? data.length - 1
            : fault === "growth"
              ? data.length + 1
              : data.length,
      };
    });
    vi.mocked(fs.open).mockResolvedValue({
      stat: async () => ({
        isFile: () => true,
        size: fault === "size" ? 1000000 : data.length,
      }),
      read,
      close,
    } as unknown as Awaited<ReturnType<typeof fs.open>>);
    const response = await request(clip.version);
    expect(response.status).toBe(503);
    expect((await response.arrayBuffer()).byteLength).toBe(0);
    expect(close).toHaveBeenCalledOnce();
    if (fault === "size") expect(read).not.toHaveBeenCalled();
    else expect(read.mock.calls[0][0].length).toBe(clip.bytes + 1);
  },
);
it("fails unavailable media closed without exposing filesystem errors", async () => {
  vi.mocked(fs.open).mockRejectedValue(new Error("missing fixture"));
  const response = await request(clips[0].version);
  expect(response.status).toBe(503);
  expect(await response.text()).toBe("");
});
