// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
  fireEvent.click(screen.getByRole("button", { name: "Save assessment" }));
  await screen.findByText(
    "Saved assessment: aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
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
  fireEvent.click(screen.getByRole("button", { name: "Save assessment" }));
  await screen.findByText("Saved assessment: saved-1");
  fireEvent.click(screen.getByRole("button", { name: "Preview assessment" }));
  await screen.findByText(brief.text);
  await vi.waitFor(() =>
    expect(screen.queryByText("Saved assessment: saved-1")).toBeNull(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Save assessment" }));
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
  fireEvent.click(screen.getByRole("button", { name: "Save assessment" }));
  await screen.findByText(
    "Assessment saved. Keep its ID to reopen later. Newer evidence is available.",
  );
});
