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
