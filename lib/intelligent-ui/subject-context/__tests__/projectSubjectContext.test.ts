import { describe, expect, it } from "vitest";
import { projectSubjectContext } from "../projectSubjectContext";
import { contextObjectRef } from "../../descriptors/contextObjectRef";
import type { ObjectDescriptor } from "../../descriptors/schemas";

const workspaceId = "11111111-1111-4111-8111-111111111111";
const subjectId = "22222222-2222-4222-8222-222222222222";
const selectedId = "33333333-3333-4333-8333-333333333333";
const version = "44444444-4444-4444-8444-444444444444";
const newerVersion = "55555555-5555-4555-8555-555555555555";
const ref = (id: string) =>
  contextObjectRef(workspaceId, {
    ownerId: workspaceId,
    subjectId: id,
    kind: "recording",
    identityConfirmed: true,
    sourceVersionIds: [version],
  })!;
const descriptor = (id: string): ObjectDescriptor => ({
  ref: ref(id),
  label: "PRIVATE_LABEL",
  field: {
    value: { state: "withheld" },
    role: "observed",
    metric: "streams",
    unit: null,
    currency: null,
    periodStart: null,
    periodEnd: null,
    territory: "PRIVATE_TERRITORY",
    basis: "PRIVATE_BASIS",
    observedAt: "2026-10-30T00:00:00Z",
  },
});
const current = () => ({
  bindingKey: "local-actor-session-chat-query:epoch-1",
  context: {
    workspaceId,
    surfaceId: "surface-1",
    revision: 4,
    subject: ref(subjectId),
    purpose: "creative_direction",
  },
  descriptors: [descriptor(subjectId), descriptor(selectedId)],
});
const proposed = () => ({
  bindingKey: current().bindingKey,
  context: { ...current().context, selection: [ref(selectedId)] },
});
const unavailable = { state: "unavailable" };

describe("SubjectContext follow-up projection", () => {
  it("projects only exact subject, purpose, revision and explicitly selected source refs", () => {
    const result = projectSubjectContext(proposed(), current());
    expect(result).toEqual({ state: "available", context: proposed().context });
    expect(JSON.stringify(result)).not.toContain("PRIVATE");
    expect(JSON.stringify(result)).not.toContain("bindingKey");
    expect(JSON.stringify(result)).not.toContain("local-actor");
  });
  it("does not implicitly select the available dataset", () => {
    const candidate = proposed();
    candidate.context.selection = [];
    expect(projectSubjectContext(candidate, current())).toEqual({
      state: "available",
      context: candidate.context,
    });
  });
  it.each([
    { bindingKey: "changed-session-or-query:epoch-2" },
    { context: { ...current().context, revision: 5 } },
    { context: { ...current().context, workspaceId: newerVersion } },
    { context: { ...current().context, surfaceId: "different-surface" } },
    { context: { ...current().context, subject: ref(selectedId) } },
    { context: { ...current().context, purpose: "playlist_pitch" } },
  ])("refuses a proposal after its host or view identity changes", (change) => {
    expect(
      projectSubjectContext(proposed(), { ...current(), ...change }),
    ).toEqual(unavailable);
  });
  it("rejects changed selected source versions and a stale focal subject", () => {
    for (const id of [subjectId, selectedId]) {
      const now = current();
      now.descriptors = now.descriptors.map((item) =>
        item.ref.id === id
          ? { ...item, ref: { ...item.ref, sourceVersionIds: [newerVersion] } }
          : item,
      );
      expect(projectSubjectContext(proposed(), now)).toEqual(unavailable);
    }
  });
  it("treats version order as a set while retaining the exact version identities", () => {
    const now = current();
    now.descriptors[1].ref.sourceVersionIds = [version, newerVersion];
    const candidate = proposed();
    candidate.context.selection[0].sourceVersionIds = [newerVersion, version];
    expect(projectSubjectContext(candidate, now)).toEqual({
      state: "available",
      context: candidate.context,
    });
  });
  it("rejects missing, duplicate, wrong-authority or wrong-kind selection refs", () => {
    const selected = ref(selectedId);
    for (const selection of [
      [ref(newerVersion)],
      [selected, selected],
      [{ ...selected, authority: "fixture" }],
      [{ ...selected, kind: "composition" }],
      [{ ...selected, workspaceId: newerVersion }],
    ])
      expect(
        projectSubjectContext(
          { ...proposed(), context: { ...proposed().context, selection } },
          current(),
        ),
      ).toEqual(unavailable);
  });
  it("rejects ambiguous descriptors, malformed refs and excessive selection", () => {
    const now = current();
    now.descriptors.push(descriptor(selectedId));
    expect(projectSubjectContext(proposed(), now)).toEqual(unavailable);
    for (const selection of [
      [{ id: selectedId }],
      Array(9).fill(ref(selectedId)),
    ])
      expect(
        projectSubjectContext(
          { ...proposed(), context: { ...proposed().context, selection } },
          current(),
        ),
      ).toEqual(unavailable);
  });
  it("rejects hidden fields supplied in the follow-up proposal", () => {
    const candidate = proposed();
    expect(
      projectSubjectContext({ ...candidate, prompt: "PRIVATE" }, current()),
    ).toEqual(unavailable);
    expect(
      projectSubjectContext(
        {
          ...candidate,
          context: { ...candidate.context, hiddenRows: ["PRIVATE"] },
        },
        current(),
      ),
    ).toEqual(unavailable);
    expect(
      projectSubjectContext(
        {
          ...candidate,
          context: {
            ...candidate.context,
            selection: [{ ...ref(selectedId), label: "PRIVATE" }],
          },
        },
        current(),
      ),
    ).toEqual(unavailable);
  });
  it("returns detached refs rather than mutable descriptor or input aliases", () => {
    const candidate = proposed();
    const now = current();
    const result = projectSubjectContext(candidate, now);
    candidate.context.selection[0].sourceVersionIds.push(newerVersion);
    now.descriptors[0].ref.sourceVersionIds.push(newerVersion);
    expect(result).toEqual({ state: "available", context: proposed().context });
  });
});

it("rejects competing versions for the same object in the current descriptor set", () => {
  const now = current();
  const conflicting = descriptor(selectedId);
  conflicting.ref.sourceVersionIds = [newerVersion];
  now.descriptors.push(conflicting);
  expect(projectSubjectContext(proposed(), now)).toEqual(unavailable);
});

it("rejects invalid revisions and descriptor sets outside the existing 200-item bound", () => {
  expect(
    projectSubjectContext(proposed(), {
      ...current(),
      context: { ...current().context, revision: -1 },
    }),
  ).toEqual(unavailable);
  const descriptors = [
    ...current().descriptors,
    ...Array.from({ length: 199 }, (_, i) =>
      descriptor(`66666666-6666-4666-8666-${String(i).padStart(12, "0")}`),
    ),
  ];
  expect(
    projectSubjectContext(proposed(), {
      ...current(),
      descriptors: descriptors.slice(0, 200),
    }).state,
  ).toBe("available");
  expect(
    projectSubjectContext(proposed(), { ...current(), descriptors }),
  ).toEqual(unavailable);
});
