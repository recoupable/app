import { expect, it } from "vitest";
import { buildExecutionNodeRows } from "../buildExecutionNodeRows";
import type { ExecutionTrace, PlanNode } from "../executionTypes";

const subject = "00000000-0000-4000-8000-000000000010";
const resultId = "00000000-0000-4000-8000-000000000020";
const node = (
  module: string,
  state: PlanNode["state"],
  dependsOn: string[] = [],
): PlanNode => ({
  key: `${subject}:${module}`,
  subjectId: subject,
  module,
  state,
  dependsOn,
});
const trace: ExecutionTrace = {
  id: "00000000-0000-4000-8000-000000000001",
  request_id: "00000000-0000-4000-8000-000000000002",
  policy_version: "metadata-review-v1",
  created_at: "2026-10-10T10:00:00+00:00",
  plan: [
    node("spotify_release", "ready_for_dispatch"),
    node("musicbrainz", "reuse_candidate", [`${subject}:spotify_release`]),
    node("mlc_recording", "ready_for_dispatch", [`${subject}:musicbrainz`]),
    node("songstats", "blocked"),
    node("catalog_valuation", "not_implemented"),
    node("saved_socials", "ready_for_dispatch"),
    node("mlc_search", "ready_for_dispatch"),
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
      node_key: `${subject}:musicbrainz`,
      outcome: {
        key: `${subject}:musicbrainz`,
        status: "reused",
        receipt: { state: "reused", resultId },
      },
      recorded_at: "2026-10-10T10:02:00+00:00",
    },
    {
      node_key: `${subject}:mlc_recording`,
      outcome: {
        key: `${subject}:mlc_recording`,
        status: "failed",
        failureStage: "dispatch",
        reasons: ["provider_unavailable"],
      },
      recorded_at: "2026-10-10T10:03:00+00:00",
    },
    {
      node_key: `${subject}:songstats`,
      outcome: {
        key: `${subject}:songstats`,
        status: "blocked",
        blockReason: "plan_blocked",
        reasons: ["collection_not_permitted"],
      },
      recorded_at: "2026-10-10T10:04:00+00:00",
    },
    {
      node_key: `${subject}:catalog_valuation`,
      outcome: {
        key: `${subject}:catalog_valuation`,
        status: "blocked",
        blockReason: "not_implemented",
        blockedBy: [`${subject}:songstats`],
      },
      recorded_at: "2026-10-10T10:05:00+00:00",
    },
  ],
  claims: [
    {
      nodeKey: `${subject}:spotify_release`,
      claimedAt: "2026-10-10T10:00:30+00:00",
      state: "saved",
    },
    {
      nodeKey: `${subject}:mlc_recording`,
      claimedAt: "2026-10-10T10:02:30+00:00",
      state: "failed",
    },
    {
      nodeKey: `${subject}:saved_socials`,
      claimedAt: "2026-10-10T10:06:00+00:00",
      state: "unknown",
    },
  ],
};
const rows = buildExecutionNodeRows(trace);
const row = (module: string) => {
  const found = rows.find((entry) => entry.module === module);
  if (!found) throw new Error(`Missing row for ${module}`);
  return found;
};

it("keeps plan order and separates template, implemented and policy-blocked nodes", () => {
  expect(rows.map((entry) => entry.key)).toEqual(
    trace.plan.map((entry) => entry.key),
  );
  expect(row("spotify_release").implementation).toBe("implemented");
  expect(row("musicbrainz").implementation).toBe("implemented");
  expect(row("songstats").implementation).toBe("blocked by policy");
  expect(row("catalog_valuation").implementation).toBe("template");
});

it("reads the review state from the outcome, then the claim, then not_started", () => {
  expect(row("spotify_release")).toMatchObject({
    reviewState: "saved",
    reviewLabel: "saved",
    resultId,
    claimedAt: "2026-10-10T10:00:30+00:00",
    recordedAt: "2026-10-10T10:01:00+00:00",
  });
  expect(row("musicbrainz")).toMatchObject({
    reviewState: "reused",
    resultId,
    dependsOn: [`${subject}:spotify_release`],
  });
  expect(row("mlc_recording")).toMatchObject({
    reviewState: "failed",
    failureStage: "dispatch",
    reasons: ["provider_unavailable"],
  });
  expect(row("songstats")).toMatchObject({
    reviewState: "blocked",
    blockReason: "plan_blocked",
    reasons: ["collection_not_permitted"],
  });
  expect(row("catalog_valuation")).toMatchObject({
    reviewState: "blocked",
    blockReason: "not_implemented",
    blockedBy: [`${subject}:songstats`],
  });
  expect(row("saved_socials")).toMatchObject({
    reviewState: "unknown",
    reviewLabel: "unknown (claimed, needs reconciliation)",
    claimedAt: "2026-10-10T10:06:00+00:00",
  });
  expect(row("saved_socials").recordedAt).toBeUndefined();
  expect(row("mlc_search")).toMatchObject({
    reviewState: "not_started",
    reviewLabel: "not_started",
  });
  expect(row("mlc_search").claimedAt).toBeUndefined();
});

it("never reports a zero cost or inferred timing and names what was not recorded", () => {
  for (const entry of rows) {
    expect(entry.cost).toBe("unknown");
    expect(entry.timing).toBe("recorded timestamps only");
    expect(entry.missing).toContain(
      "No cost recorded; cost is unknown, not zero.",
    );
    expect(entry.missing).toContain("No prompts recorded for this node.");
  }
  expect(row("saved_socials").missing).toContain(
    "No outcome recorded; reconcile the claim before any retry.",
  );
  expect(row("mlc_search").missing).toContain("No claim or outcome recorded.");
  expect(row("spotify_release").missing).not.toContain(
    "No claim or outcome recorded.",
  );
});
