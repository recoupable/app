// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useCompanyAssessment } from "../useCompanyAssessment";
const brief = {
  purpose: "company_onboarding",
  text: "Evidence",
  readiness: "partial",
  missingTopics: [],
  guidance: "Unverified assertions.",
};
const snapshot = { id: "saved", state: "saved", superseded: false, brief };
afterEach(() => vi.unstubAllGlobals());
it("invalidates snapshot synchronously before awaiting a new request and never revives an old object", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ snapshot })),
  );
  let resolveToken!: (token: string) => void;
  let pending = false;
  const { result, unmount } = renderHook(() =>
    useCompanyAssessment("request", "org", () =>
      pending
        ? new Promise<string>((resolve) => {
            resolveToken = resolve;
          })
        : Promise.resolve("token"),
    ),
  );
  await act(async () => result.current.run("read_brief"));
  const old = result.current.snapshot!;
  expect(result.current.isCurrentSnapshot(old)).toBe(true);
  const firstRevision = result.current.operationRevision;
  pending = true;
  let request!: Promise<void>;
  act(() => {
    request = result.current.run("read_brief");
    expect(result.current.isCurrentSnapshot(old)).toBe(false);
  });
  expect(result.current.operationRevision).toBeGreaterThan(firstRevision);
  await act(async () => {
    resolveToken("token");
    await request;
  });
  expect(result.current.isCurrentSnapshot(old)).toBe(false);
  const current = result.current.snapshot!;
  expect(result.current.isCurrentSnapshot(current)).toBe(true);
  const staleGuard = result.current.isCurrentSnapshot;
  unmount();
  expect(staleGuard(current)).toBe(false);
});
it("keeps a previous snapshot ineligible after an unsuccessful read", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(Response.json({ snapshot }))
    .mockResolvedValueOnce(new Response(null, { status: 403 }));
  vi.stubGlobal("fetch", fetcher);
  const { result } = renderHook(() =>
    useCompanyAssessment("request", "org", async () => "token"),
  );
  await act(async () => result.current.run("read_brief"));
  const old = result.current.snapshot!;
  await act(async () => result.current.run("read_brief"));
  expect(result.current.snapshot).toBeNull();
  expect(result.current.isCurrentSnapshot(old)).toBe(false);
});
