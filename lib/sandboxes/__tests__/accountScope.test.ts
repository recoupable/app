import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { getSandboxes } from "../getSandboxes";
import { getFileContents } from "../getFileContents";

vi.mock("@/lib/api/getClientApiBaseUrl", () => ({
  getClientApiBaseUrl: () => "https://api.example.test",
}));
const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

it.each([undefined, "wrong-account"])(
  "rejects overridden listing and contents when the API echoes %s",
  async (account_id) => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "success",
        account_id,
        content: "wrong account",
        sandboxes: [],
        filetree: [],
      }),
    });
    await expect(getSandboxes("token", "selected-b")).rejects.toThrow(
      /selected account/i,
    );
    await expect(
      getFileContents("token", "path.txt", { accountId: "selected-b" }),
    ).rejects.toThrow(/selected account/i);
  },
);

it("encodes the override/path and accepts only the matching response account", async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      status: "success",
      account_id: "selected-b",
      content: "B",
      sandboxes: [],
      filetree: [],
    }),
  });
  await expect(getSandboxes("token", "selected-b")).resolves.toEqual({
    sandboxes: [],
    filetree: [],
  });
  await expect(
    getFileContents("token", "a & b.txt", { accountId: "selected-b" }),
  ).resolves.toEqual({ content: "B", imageUrl: null });
  const urls = fetchMock.mock.calls.map(([url]) => new URL(url));
  expect(
    urls.every((url) => url.searchParams.get("account_id") === "selected-b"),
  ).toBe(true);
  expect(urls[1].searchParams.get("path")).toBe("a & b.txt");
});

it("never fetches a writable revision for an override", async () => {
  await expect(
    getFileContents("token", "path.txt", {
      accountId: "selected-b",
      includeRevision: true,
    }),
  ).rejects.toThrow(/read.only/i);
  expect(fetchMock).not.toHaveBeenCalled();
});

it("keeps normal self-account response shapes compatible", async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      status: "success",
      content: "self",
      sandboxes: [],
      filetree: [],
    }),
  });
  await expect(getSandboxes("token")).resolves.toEqual({
    sandboxes: [],
    filetree: [],
  });
  await expect(getFileContents("token", "path.txt")).resolves.toEqual({
    content: "self",
    imageUrl: null,
  });
  expect(
    fetchMock.mock.calls.every(
      ([url]) => !new URL(url).searchParams.has("account_id"),
    ),
  ).toBe(true);
});
