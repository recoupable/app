// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ReleaseExecutionTrace from "../ReleaseExecutionTrace";
const subject = "00000000-0000-4000-8000-000000000010";
const executionId = "00000000-0000-4000-8000-000000000001";
const resultId = "00000000-0000-4000-8000-000000000020";
const summary = {
  executionId,
  policyVersion: "metadata-review-v1",
  createdAt: "2026-10-10T10:00:00+00:00",
  nodeCount: 4,
  outcomeCount: 2,
};
const execution = {
  id: executionId,
  request_id: "request",
  policy_version: "metadata-review-v1",
  created_at: "2026-10-10T10:00:00+00:00",
  plan: [
    {
      key: `${subject}:spotify_release`,
      subjectId: subject,
      module: "spotify_release",
      state: "ready_for_dispatch",
      dependsOn: [],
    },
    {
      key: `${subject}:songstats`,
      subjectId: subject,
      module: "songstats",
      state: "blocked",
      dependsOn: [],
    },
    {
      key: `${subject}:saved_socials`,
      subjectId: subject,
      module: "saved_socials",
      state: "ready_for_dispatch",
      dependsOn: [`${subject}:spotify_release`],
    },
    {
      key: `${subject}:catalog_valuation`,
      subjectId: subject,
      module: "catalog_valuation",
      state: "not_implemented",
      dependsOn: [],
    },
  ],
  outcomes: [
    {
      node_key: `${subject}:spotify_release`,
      outcome: {
        key: `${subject}:spotify_release`,
        status: "saved",
        receipt: { state: "saved", resultId },
      },
      recorded_at: "2026-10-10T10:01:00+00:00",
    },
    {
      node_key: `${subject}:songstats`,
      outcome: {
        key: `${subject}:songstats`,
        status: "blocked",
        blockReason: "plan_blocked",
        reasons: ["collection_not_permitted"],
      },
      recorded_at: "2026-10-10T10:02:00+00:00",
    },
  ],
  claims: [
    {
      nodeKey: `${subject}:spotify_release`,
      claimedAt: "2026-10-10T10:00:30+00:00",
      state: "saved",
    },
    {
      nodeKey: `${subject}:saved_socials`,
      claimedAt: "2026-10-10T10:03:00+00:00",
      state: "unknown",
    },
  ],
};
afterEach(() => vi.unstubAllGlobals());
function mount() {
  render(
    <ReleaseExecutionTrace
      requestId="request"
      organizationId="org"
      getAccessToken={async () => "token"}
    />,
  );
}

it("lists and opens a workspace-scoped execution trace without retrying work", async () => {
  const bodies: Record<string, unknown>[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      const body = JSON.parse(init.body);
      bodies.push(body);
      expect(init.headers.Authorization).toBe("Bearer token");
      return Response.json(
        body.action === "list_executions"
          ? { executions: [summary] }
          : { execution },
      );
    }),
  );
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Load executions" }));
  await screen.findByText("metadata-review-v1");
  expect(screen.getByText(/2 of 4 nodes recorded/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /Open trace/ }));
  const table = within(
    await screen.findByRole("table", { name: "Execution nodes" }),
  );
  expect(
    table.getByText("unknown (claimed, needs reconciliation)"),
  ).toBeTruthy();
  expect(table.getByText("collection_not_permitted")).toBeTruthy();
  expect(table.getByText(resultId)).toBeTruthy();
  expect(table.getByText("template")).toBeTruthy();
  expect(table.getByText("blocked by policy")).toBeTruthy();
  expect(table.getAllByText("implemented")).toHaveLength(2);
  expect(table.getAllByText("unknown")).toHaveLength(4);
  expect(screen.queryByText(/\$0|0 credits/)).toBeNull();
  expect(screen.getByText("What the states mean")).toBeTruthy();
  expect(bodies.map((b) => b.action)).toEqual([
    "list_executions",
    "read_execution",
  ]);
  expect(bodies.every((b) => b.organization_id === "org")).toBe(true);
  expect(bodies[0].request_id).toBe("request");
  expect(bodies[1].execution_id).toBe(executionId);
});

it("shows an empty state instead of an error when nothing was recorded", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ executions: [] })),
  );
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Load executions" }));
  await screen.findByText("No recorded executions for this request.");
  expect(screen.queryByRole("alert")).toBeNull();
});

it("asks for sign-in when the shared request helper reports expired credentials", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(null, { status: 401 })),
  );
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Load executions" }));
  await screen.findByText("Please sign in again.");
});

it("keeps raw failures out of the reviewer UI", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(JSON.stringify({ error: "pg: relation missing" }), {
          status: 409,
        }),
    ),
  );
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Load executions" }));
  await screen.findByText(
    "Execution traces unavailable. Check your workspace and that this request is saved.",
  );
  expect(screen.queryByText(/relation missing/)).toBeNull();
});
