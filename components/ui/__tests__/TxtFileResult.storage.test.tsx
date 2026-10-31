// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TxtFileResult } from "../TxtFileResult";
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it.each([
  {
    txtUrl:
      "https://project.supabase.co/storage/v1/object/public/public-uploads/a/file.txt",
    arweaveUrl: "https://arweave.net/legacy",
    expected:
      "https://project.supabase.co/storage/v1/object/public/public-uploads/a/file.txt",
  },
  {
    arweaveUrl: "https://arweave.net/legacy",
    expected: "https://arweave.net/legacy",
  },
])(
  "reads and downloads the preferred new URL with legacy fallback",
  async ({ expected, ...result }) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("saved text"));
    vi.stubGlobal("fetch", fetchMock);
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<TxtFileResult result={{ success: true, ...result }} />);
    expect(await screen.findByText("saved text")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      expected,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(open).toHaveBeenCalledWith(expected, "_blank");
  },
);

it("ignores an old response after switching results", async () => {
  let resolveOld!: (response: Response) => void;
  const old = new Promise<Response>((resolve) => {
    resolveOld = resolve;
  });
  const fetchMock = vi
    .fn()
    .mockReturnValueOnce(old)
    .mockResolvedValueOnce(new Response("current text"));
  vi.stubGlobal("fetch", fetchMock);
  const { rerender } = render(
    <TxtFileResult
      result={{ success: true, arweaveUrl: "https://arweave.net/old" }}
    />,
  );
  rerender(
    <TxtFileResult
      result={{
        success: true,
        txtUrl:
          "https://project.supabase.co/storage/v1/object/public/public-uploads/current.txt",
      }}
    />,
  );
  expect(await screen.findByText("current text")).toBeTruthy();
  expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  await act(async () => {
    resolveOld(new Response("stale text"));
    await old;
  });
  expect(screen.queryByText("stale text")).toBeNull();
  expect(screen.getByText("current text")).toBeTruthy();
});
