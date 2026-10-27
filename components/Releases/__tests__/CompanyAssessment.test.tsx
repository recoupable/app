// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CompanyAssessment from "../CompanyAssessment";
const brief = {
  purpose: "company_onboarding",
  text: "Submitted release locator. Metadata unverified.",
  readiness: "partial",
  missingTopics: ["release_metadata"],
  guidance: "Metadata does not verify rights.",
};
afterEach(() => vi.unstubAllGlobals());
it("previews, saves and reopens the same workspace-scoped assessment", async () => {
  const bodies: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body);
      bodies.push(body);
      expect(init.headers.Authorization).toBe("Bearer token");
      return Response.json(
        body.action === "brief"
          ? brief
          : {
              snapshot: {
                id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                state: "saved",
                brief,
              },
            },
      );
    }),
  );
  render(
    <CompanyAssessment
      requestId="request"
      organizationId="org"
      getAccessToken={async () => "token"}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Preview assessment" }));
  await screen.findByText(brief.text);
  fireEvent.click(
    screen.getByRole("button", { name: "Save assessment snapshot" }),
  );
  await screen.findByText(
    "Saved assessment: aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  );
  expect(
    screen
      .getByRole("link", { name: "Start catalog audit" })
      .getAttribute("href"),
  ).toBe(
    "/catalogs/reviews?assessment=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa&workspace=org",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Open saved assessment" }),
  );
  await screen.findByText("Saved assessment reopened.");
  expect(bodies.map((b) => b.action)).toEqual([
    "brief",
    "save_brief",
    "read_brief",
  ]);
  expect(bodies.every((b) => b.organization_id === "org")).toBe(true);
  expect(bodies[1]).toMatchObject({
    request_id: "request",
    purpose: "company_onboarding",
    idempotency_key: expect.any(String),
  });
  expect(bodies[2].brief_id).toBe("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
});
it("reopens by saved ID in a new component and withholds unavailable evidence", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        snapshot: {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          state: "unavailable",
          brief: null,
        },
      }),
    ),
  );
  render(
    <CompanyAssessment
      requestId="request"
      organizationId="org"
      getAccessToken={async () => "token"}
    />,
  );
  fireEvent.change(screen.getByLabelText("Saved assessment ID"), {
    target: { value: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Open saved assessment" }),
  );
  await screen.findByText(
    "This saved assessment is unavailable. Check current access and evidence.",
  );
  expect(screen.queryByText(brief.text)).toBeNull();
});

it("starts a new save revision when a new preview replaces a saved assessment", async () => {
  const saves: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body);
      if (body.action === "brief") return Response.json(brief);
      saves.push(body.idempotency_key);
      return Response.json({
        snapshot: { id: `saved-${saves.length}`, state: "saved", brief },
      });
    }),
  );
  render(
    <CompanyAssessment
      requestId="request"
      organizationId="org"
      getAccessToken={async () => "token"}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Preview assessment" }));
  await screen.findByText(brief.text);
  fireEvent.click(
    screen.getByRole("button", { name: "Save assessment snapshot" }),
  );
  await screen.findByText("Saved assessment: saved-1");
  fireEvent.click(screen.getByRole("button", { name: "Preview assessment" }));
  await screen.findByText(brief.text);
  await waitFor(() =>
    expect(screen.queryByText("Saved assessment: saved-1")).toBeNull(),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Save assessment snapshot" }),
  );
  await screen.findByText("Saved assessment: saved-2");
  expect(saves[1]).not.toBe(saves[0]);
});
it("withholds a brief even if an unavailable response incorrectly includes one", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({ snapshot: { id: "id", state: "unavailable", brief } }),
    ),
  );
  render(
    <CompanyAssessment
      requestId="request"
      organizationId="org"
      getAccessToken={async () => "token"}
    />,
  );
  fireEvent.change(screen.getByLabelText("Saved assessment ID"), {
    target: { value: "id" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Open saved assessment" }),
  );
  await screen.findByText(
    "This saved assessment is unavailable. Check current access and evidence.",
  );
  expect(screen.queryByText(brief.text)).toBeNull();
});
it("asks for sign-in when the shared request helper reports expired credentials", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(null, { status: 401 })),
  );
  render(
    <CompanyAssessment
      requestId="request"
      organizationId="org"
      getAccessToken={async () => "token"}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Preview assessment" }));
  await screen.findByText("Please sign in again.");
});
it("keeps the save confirmation when the returned snapshot is superseded", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) =>
      Response.json(
        JSON.parse(init.body).action === "brief"
          ? brief
          : {
              snapshot: {
                id: "saved",
                state: "saved",
                superseded: true,
                brief,
              },
            },
      ),
    ),
  );
  render(
    <CompanyAssessment
      requestId="request"
      organizationId="org"
      getAccessToken={async () => "token"}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Preview assessment" }));
  await screen.findByText(brief.text);
  fireEvent.click(
    screen.getByRole("button", { name: "Save assessment snapshot" }),
  );
  await screen.findByText(
    "Assessment saved. Keep its ID to reopen later. Newer evidence is available.",
  );
});

const manifest = {
  compilerVersion: "context-brief-v1",
  method: "saved_evidence_selection",
  requestIds: ["request-in-snapshot"],
  excludedTopics: [],
  documents: [
    {
      documentId: "doc-one",
      resultId: "result-one",
      subjectId: "subject-one",
      topic: "release_locator",
      version: 7,
      sourceVersionIds: ["source-version-one"],
    },
  ],
};
const frozenBrief = { ...brief, input_manifest: manifest };
const mount = () =>
  render(
    <CompanyAssessment
      requestId="current-request"
      organizationId="org"
      getAccessToken={async () => "token"}
    />,
  );
function openSaved() {
  fireEvent.change(screen.getByLabelText("Saved assessment ID"), {
    target: { value: "frozen-id" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Open saved assessment" }),
  );
}
it("renders exact saved provenance rather than the currently selected request", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        snapshot: {
          id: "frozen-id",
          state: "saved",
          created_at: "2026-10-10T02:33:08Z",
          superseded: true,
          brief: frozenBrief,
        },
      }),
    ),
  );
  mount();
  openSaved();
  await screen.findByText("doc-one");
  for (const value of [
    "request-in-snapshot",
    "result-one",
    "subject-one",
    "source-version-one",
    "context-brief-v1",
    "7",
    "2026-10-10T02:33:08Z",
  ])
    expect(screen.getByText(value)).toBeTruthy();
  expect(screen.queryByText("current-request")).toBeNull();
  expect(screen.getByText("Newer evidence available")).toBeTruthy();
});
it("reports missing provenance without inventing version references", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({ snapshot: { id: "frozen-id", state: "saved", brief } }),
    ),
  );
  mount();
  openSaved();
  await screen.findByText(
    "Source-version details are unavailable for this assessment.",
  );
  expect(screen.queryByText("doc-one")).toBeNull();
});
it.each(["network", "server"])(
  "retries an uncertain %s save using the same key and suppresses duplicate clicks",
  async (failure) => {
    const keys: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url, init) => {
        const body = JSON.parse(init.body);
        if (body.action === "brief") return Response.json(frozenBrief);
        keys.push(body.idempotency_key);
        if (keys.length === 1) {
          if (failure === "network")
            throw new TypeError("network response lost");
          return new Response(null, { status: 503 });
        }
        return Response.json({
          snapshot: { id: "frozen-id", state: "saved", brief: frozenBrief },
        });
      }),
    );
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Preview assessment" }));
    await screen.findByText(brief.text);
    fireEvent.click(
      screen.getByRole("button", { name: "Save assessment snapshot" }),
    );
    const retry = await screen.findByRole("button", {
      name: "Retry saving assessment",
    });
    fireEvent.click(retry);
    fireEvent.click(retry);
    await screen.findByText("Saved assessment: frozen-id");
    expect(keys).toHaveLength(2);
    expect(keys[0]).toBe(keys[1]);
  },
);
it.each([401, 403, 404])(
  "withholds previously visible provenance after access failure %i",
  async (status) => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          snapshot: { id: "frozen-id", state: "saved", brief: frozenBrief },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "private diagnostic" }), {
          status,
        }),
      );
    vi.stubGlobal("fetch", fetcher);
    mount();
    openSaved();
    await screen.findByText("doc-one");
    openSaved();
    await waitFor(() => expect(screen.queryByText("doc-one")).toBeNull());
    expect(screen.queryByText("source-version-one")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Retry saving assessment" }),
    ).toBeNull();
    expect(screen.queryByText("private diagnostic")).toBeNull();
  },
);
