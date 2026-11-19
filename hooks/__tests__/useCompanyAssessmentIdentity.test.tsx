// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useCompanyAssessment } from "../useCompanyAssessment";
const requestedId = "a1111111-1111-4111-8111-111111111111";
const unrelatedId = "22222222-2222-4222-8222-222222222222";
const brief = {
  purpose: "company_onboarding",
  text: "Unrelated private artifact",
  readiness: "partial",
  missingTopics: [],
  guidance: "Unverified assertions.",
};
afterEach(() => vi.unstubAllGlobals());
it("withholds a saved artifact returned for a different requested ID", async () => {
  const fetcher = vi.fn<typeof fetch>(async () =>
    Response.json({
      snapshot: {
        id: unrelatedId,
        state: "saved",
        superseded: false,
        brief,
      },
    }),
  );
  vi.stubGlobal("fetch", fetcher);
  const { result } = renderHook(() =>
    useCompanyAssessment("request", "org", async () => "synthetic"),
  );
  act(() => result.current.setOpenId(requestedId));
  await act(async () => result.current.run("read_brief"));
  expect(JSON.parse(fetcher.mock.calls[0][1]!.body as string).brief_id).toBe(
    requestedId,
  );
  expect(result.current.snapshot).toBeNull();
  expect(result.current.brief).toBeNull();
  expect(result.current.savedId).toBe("");
  expect(result.current.openId).toBe(requestedId);
  expect(result.current.retrySave).toBe(false);
});

it("reopens the same saved snapshot after the first hook is lost", async () => {
  const saved = {
    id: requestedId,
    state: "saved",
    superseded: false,
    brief: {
      ...brief,
      text: "Exact saved version",
      input_manifest: {
        documents: [
          {
            documentId: unrelatedId,
            version: 3,
            sourceVersionIds: [requestedId],
          },
        ],
      },
    },
  };
  const requests: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(async (_url, init) => {
      const body = JSON.parse(init!.body as string);
      requests.push(body);
      if (
        body.action === "save_brief" ||
        (body.action === "read_brief" &&
          body.brief_id.toLowerCase() === requestedId)
      )
        return Response.json({ snapshot: saved });
      return new Response(null, { status: 404 });
    }),
  );
  const first = renderHook(() =>
    useCompanyAssessment("request", "org", async () => "synthetic"),
  );
  await act(async () => first.result.current.run("save_brief"));
  const savedId = first.result.current.savedId;
  expect(savedId).toBe(requestedId);
  first.unmount();
  const second = renderHook(() =>
    useCompanyAssessment("different-request", "org", async () => "synthetic"),
  );
  act(() => second.result.current.setOpenId(`  ${savedId.toUpperCase()}  `));
  await act(async () => second.result.current.run("read_brief"));
  expect(second.result.current.snapshot).toEqual(saved);
  expect(requests.map((body) => body.action)).toEqual([
    "save_brief",
    "read_brief",
  ]);
  expect(requests[1]).toEqual({
    action: "read_brief",
    brief_id: savedId.toUpperCase(),
    organization_id: "org",
  });
});
it("binds delayed readback to the submitted ID rather than an edited input", async () => {
  let finish!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn<typeof fetch>(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    ),
  );
  const { result } = renderHook(() =>
    useCompanyAssessment("request", "org", async () => "synthetic"),
  );
  act(() => result.current.setOpenId(requestedId));
  let pending!: Promise<void>;
  await act(async () => {
    pending = result.current.run("read_brief");
  });
  act(() => result.current.setOpenId(unrelatedId));
  await act(async () => {
    finish(
      Response.json({
        snapshot: { id: unrelatedId, state: "saved", superseded: false, brief },
      }),
    );
    await pending;
  });
  expect(result.current.snapshot).toBeNull();
  expect(result.current.notice).toContain("did not match");
});
it.each([403, 404])(
  "withholds prior saved text when reopen returns %s without another source lookup",
  async (status) => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({
          snapshot: {
            id: requestedId,
            state: "saved",
            superseded: false,
            brief,
          },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status }));
    vi.stubGlobal("fetch", fetcher);
    const { result } = renderHook(() =>
      useCompanyAssessment("request", "org", async () => "synthetic"),
    );
    act(() => result.current.setOpenId(requestedId));
    await act(async () => result.current.run("read_brief"));
    const previous = result.current.snapshot!;
    await act(async () => result.current.run("read_brief"));
    expect(result.current.snapshot).toBeNull();
    expect(result.current.brief).toBeNull();
    expect(result.current.isCurrentSnapshot(previous)).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls.every(([url]) => url === "/api/context")).toBe(
      true,
    );
  },
);
