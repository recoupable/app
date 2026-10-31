import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { uploadPublicFile } from "../uploadPublicFile";
import {
  MAX_PUBLIC_UPLOAD_BYTES,
  preparePublicUpload,
} from "../preparePublicUpload";

const url =
  "https://project.supabase.co/storage/v1/object/public/public-uploads/actor/test.png";
const file = () => new File(["image"], "cover.png", { type: "image/png" });
const fetchMock = vi.fn();
const args = () => ({
  file: file(),
  accessToken: "session-token",
  apiBaseUrl: "https://api.example",
  signal: new AbortController().signal,
});
beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

it("sends only a multipart file and bearer identity to the dedicated API", async () => {
  fetchMock.mockResolvedValue(
    Response.json({
      success: true,
      fileName: "cover.png",
      fileType: "image/png",
      fileSize: 5,
      url,
    }),
  );
  const input = args();
  expect(await uploadPublicFile(input)).toMatchObject({ url, fileSize: 5 });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [endpoint, request] = fetchMock.mock.calls[0];
  expect(endpoint).toBe("https://api.example/api/upload");
  expect(request.headers).toEqual({ Authorization: "Bearer session-token" });
  expect(request.signal).toBe(input.signal);
  expect([...request.body.keys()]).toEqual(["file"]);
  expect(request.body.get("file").name).toBe("cover.png");
});

it("never sends a request without a token", async () => {
  await expect(
    uploadPublicFile({ ...args(), accessToken: "" }),
  ).rejects.toThrow("sign in");
  expect(fetchMock).not.toHaveBeenCalled();
});

describe("public file preflight", () => {
  it.each([
    ["cover.PNG", "image/png"],
    ["notes.md", "text/markdown"],
    ["notes.txt", "text/plain"],
    ["data.json", "application/json"],
    ["song.m4a", "audio/x-m4a"],
  ])(
    "infers a canonical MIME for %s only when missing/generic",
    (name, type) => {
      for (const supplied of ["", "application/octet-stream"]) {
        const prepared = preparePublicUpload(
          new File(["content"], name, { type: supplied }),
        );
        expect(prepared.type).toBe(type);
        expect(prepared.name).toBe(name);
      }
    },
  );
  it("rejects explicit unsafe MIME even behind an allowed extension", () => {
    expect(() =>
      preparePublicUpload(
        new File(["<script>"], "cover.png", { type: "text/html" }),
      ),
    ).toThrow("not supported");
    expect(() =>
      preparePublicUpload(
        new File(["x"], "cover.svg", { type: "image/svg+xml" }),
      ),
    ).toThrow("not supported");
  });
  it("rejects empty and over-limit files before fetch", async () => {
    for (const candidate of [
      new File([], "empty.png", { type: "image/png" }),
      new File([new Uint8Array(MAX_PUBLIC_UPLOAD_BYTES + 1)], "large.png", {
        type: "image/png",
      }),
    ]) {
      await expect(
        uploadPublicFile({ ...args(), file: candidate }),
      ).rejects.toThrow(/empty|4 MiB/);
    }
    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      preparePublicUpload(
        new File([new Uint8Array(MAX_PUBLIC_UPLOAD_BYTES)], "limit.png", {
          type: "image/png",
        }),
      ).size,
    ).toBe(MAX_PUBLIC_UPLOAD_BYTES);
  });
});

it.each([
  [401, "sign in"],
  [413, "4 MiB"],
  [415, "contents"],
  [500, "Upload failed"],
])("safely reports non-JSON %s failures", async (status, message) => {
  fetchMock.mockResolvedValue(
    new Response("<html>private provider trace</html>", { status }),
  );
  await expect(uploadPublicFile(args())).rejects.toThrow(message);
});

it.each([
  { success: false, error: "provider details" },
  {
    success: true,
    fileName: "cover.png",
    fileType: "image/png",
    fileSize: 999,
    url,
  },
  {
    success: true,
    fileName: "cover.png",
    fileType: "text/html",
    fileSize: 5,
    url,
  },
  {
    success: true,
    fileName: "cover.png",
    fileType: "image/png",
    fileSize: 5,
    url: "https://project.supabase.co/storage/v1/object/public/private-files/key",
  },
  {
    success: true,
    fileName: "cover.png",
    fileType: "image/png",
    fileSize: 5,
    url: "https://arweave.net/new-write",
  },
])("rejects invalid or wrong-storage success receipts", async (body) => {
  fetchMock.mockResolvedValue(Response.json(body));
  await expect(uploadPublicFile(args())).rejects.toThrow("invalid response");
});
