import { createHash } from "node:crypto";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createSectionStudyAudio } from "../../createSectionStudyAudio";
import * as excerptModule from "../createAudioExcerpt";
import { createAudioExcerpt } from "../createAudioExcerpt";
import { audioExcerpts } from "../audioExcerpts";
import { audioFixtures } from "../audioFixtures";
import { resolveCreativeAsset } from "../resolveCreativeAsset";
import { GET } from "@/app/api/intelligent-ui/playground/audio-excerpts/[revision]/route";
const hash = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");
const request = (revision: string, headers?: HeadersInit) =>
  GET(
    new Request(
      `http://localhost/api/intelligent-ui/playground/audio-excerpts/${revision}`,
      { headers },
    ),
    { params: Promise.resolve({ revision }) },
  );
beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
it("preserves exact original PCM slices with truthful WAV durations and hashes", () => {
  const full = createSectionStudyAudio();
  expect(hash(full)).toBe(
    "c4349e4a106390dbb804eb48989c8d69a0596d0af369e83a2cc6f2f278e7c8af",
  );
  for (const name of Object.keys(
    audioExcerpts,
  ) as (keyof typeof audioExcerpts)[]) {
    const spec = audioExcerpts[name];
    const bytes = createAudioExcerpt(name);
    const view = new DataView(bytes.buffer);
    expect(hash(bytes)).toBe(spec.version);
    expect(bytes.subarray(44)).toEqual(
      full.subarray(
        44 + spec.startSeconds * 44100,
        44 + spec.endSeconds * 44100,
      ),
    );
    expect(view.getUint32(4, true)).toBe(bytes.length - 8);
    expect(view.getUint32(40, true) / view.getUint32(28, true)).toBe(
      spec.endSeconds - spec.startSeconds,
    );
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint16(34, true)).toBe(16);
  }
});
it("serves only exact complete WAV bytes without caching, including Range requests", async () => {
  for (const asset of audioFixtures) {
    expect(resolveCreativeAsset(asset)).toBe(
      `/api/intelligent-ui/playground/audio-excerpts/${asset.ref.version}`,
    );
    const response = await request(asset.ref.version, { Range: "bytes=0-9" });
    expect(response.status).toBe(200); // Small full resources; no partial-content claim.
    const bytes = new Uint8Array(await response.arrayBuffer());
    expect(hash(bytes)).toBe(asset.ref.version);
    expect(response.headers.get("Content-Type")).toBe("audio/wav");
    expect(response.headers.get("Content-Length")).toBe(String(bytes.length));
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(
      resolveCreativeAsset({
        ...asset,
        ref: { ...asset.ref, version: "e".repeat(64) },
      }),
    ).toBeUndefined();
  }
  expect((await request("unknown")).status).toBe(404);
});
it.each([
  ["NODE_ENV", "production"],
  ["VERCEL_ENV", "production"],
  ["NEXT_PUBLIC_VERCEL_ENV", "production"],
  ["NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false"],
])("refuses audio with %s=%s", async (key, value) => {
  vi.stubEnv(key, value);
  const response = await request(audioFixtures[0].ref.version);
  expect(response.status).toBe(404);
  expect((await response.arrayBuffer()).byteLength).toBe(0);
});

it("fails closed when synthesized bytes do not match the requested revision", async () => {
  vi.spyOn(excerptModule, "createAudioExcerpt").mockReturnValue(
    new Uint8Array([1, 2, 3]),
  );
  const response = await request(audioFixtures[0].ref.version);
  expect(response.status).toBe(503);
  expect((await response.arrayBuffer()).byteLength).toBe(0);
});
