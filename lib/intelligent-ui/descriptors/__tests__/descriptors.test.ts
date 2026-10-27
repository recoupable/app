import { describe, expect, it } from "vitest";
import {
  descriptorSchema,
  objectRefSchema,
  type ObjectDescriptor,
} from "../schemas";
import { objectRefKey } from "../objectRefKey";
import { resolveSelection as resolveIndexedSelection } from "../resolveSelection";
import { indexDescriptors } from "../indexDescriptors";
const resolveSelection = (
  workspaceId: string,
  items: readonly ObjectDescriptor[],
  selection: Parameters<typeof resolveIndexedSelection>[2],
) => resolveIndexedSelection(workspaceId, indexDescriptors(items), selection);
import { contextObjectRef } from "../contextObjectRef";
import {
  collectionResultSchema,
  type CollectionResult,
} from "../collectionResult";
import { toCollectionComponent } from "../toCollectionComponent";
import { componentSchema } from "../../schema";
import { createCatalogExplorerFixture } from "../../playground/catalog/createCatalogExplorerFixture";
import { describeCatalogRecord } from "../../playground/catalog/describeCatalogRecord";
import { getCatalogExplorerView } from "../../playground/catalog/getCatalogExplorerView";
import { compareCatalogSelection } from "../../playground/catalog/compareCatalogSelection";

const workspace = "11111111-1111-4111-8111-111111111111";
const subject = "22222222-2222-4222-8222-222222222222";
const version = "33333333-3333-4333-8333-333333333333";
const otherVersion = "44444444-4444-4444-8444-444444444444";
const input = {
  ownerId: workspace,
  subjectId: subject,
  kind: "recording",
  identityConfirmed: true,
  sourceVersionIds: [version],
};
const fixture = createCatalogExplorerFixture();
const item = describeCatalogRecord(fixture[5]);
const page = (): CollectionResult => ({
  workspaceId: item.ref.workspaceId,
  items: [item],
  nextCursor: null,
  hasMore: false,
  knownTotal: 1,
  completeness: "complete",
  aggregationScope: "population",
  population: "Supplied records",
  selection: [item.ref],
});

describe("Context projection", () => {
  it.each(["recording", "composition", "release", "company"])(
    "preserves authoritative %s identity and lineage",
    (kind) => {
      const ref = contextObjectRef(workspace, { ...input, kind });
      expect(ref).toEqual({
        workspaceId: workspace,
        authority: "context",
        id: subject,
        kind,
        sourceVersionIds: [version],
      });
      expect(objectRefSchema.parse(JSON.parse(JSON.stringify(ref)))).toEqual(
        ref,
      );
    },
  );
  it.each([
    { ...input, identityConfirmed: false },
    { ...input, subjectId: "Some Name" },
    { ...input, kind: "release_edition" },
    { ...input, ownerId: otherVersion },
    { ...input, sourceVersionIds: [] },
    { ...input, sourceVersionIds: [version, version] },
    { ...input, sourceVersionIds: ["v1"] },
    { name: "Some Name" },
  ])(
    "withholds unsupported, ambiguous or cross-workspace input",
    (candidate) => {
      expect(contextObjectRef(workspace, candidate)).toBeNull();
    },
  );
  it("keeps fixture release edition distinct from recording, composition and company", () => {
    const refs = ["recording", "composition", "release_edition", "company"].map(
      (kind) => objectRefSchema.parse({ ...item.ref, kind, id: "0000123" }),
    );
    expect(new Set(refs.map(objectRefKey)).size).toBe(4);
    expect(refs.every((ref) => ref.id === "0000123")).toBe(true);
    expect(objectRefSchema.safeParse({ ...item.ref, id: 123 }).success).toBe(
      false,
    );
  });
});

describe("exact local selection", () => {
  it("survives page/order and label changes with leading-zero identity", () => {
    const original = { ...item, ref: { ...item.ref, id: "0000123" } };
    const result = resolveSelection(
      item.ref.workspaceId,
      [{ ...original, label: "Renamed" }],
      JSON.parse(JSON.stringify([original.ref])),
    );
    expect(result).toEqual({
      state: "available",
      items: [{ ...original, label: "Renamed" }],
    });
  });
  it.each(["missing", "workspace", "kind", "version", "duplicate"])(
    "returns the same redacted failure for %s",
    (reason) => {
      let available: ObjectDescriptor[] = [item];
      if (reason === "missing") available = [];
      if (reason === "duplicate") available = [item, item];
      if (reason === "workspace")
        available = [{ ...item, ref: { ...item.ref, workspaceId: "other" } }];
      if (reason === "kind")
        available = [{ ...item, ref: { ...item.ref, kind: "composition" } }];
      if (reason === "version")
        available = [
          { ...item, ref: { ...item.ref, sourceVersionIds: ["changed"] } },
        ];
      expect(
        resolveSelection(item.ref.workspaceId, available, [item.ref]),
      ).toEqual({ state: "unavailable" });
    },
  );
  it("rejects repeated selection and cross-workspace references", () => {
    expect(
      resolveSelection(item.ref.workspaceId, [item], [item.ref, item.ref]),
    ).toEqual({ state: "unavailable" });
    expect(resolveSelection("other", [item], [item.ref])).toEqual({
      state: "unavailable",
    });
  });
  it("compares the exact version set without depending on its order", () => {
    const ref = { ...item.ref, sourceVersionIds: [version, otherVersion] };
    expect(objectRefKey(ref)).toBe(
      objectRefKey({ ...ref, sourceVersionIds: [otherVersion, version] }),
    );
    expect(objectRefKey(ref)).not.toBe(
      objectRefKey({ ...ref, sourceVersionIds: [version] }),
    );
  });
});

describe("typed values and schema-v1 collection compatibility", () => {
  it.each([
    { state: "known", amount: 0 },
    { state: "unknown" },
    { state: "withheld" },
    { state: "not-applicable" },
  ])("round trips %j without zero coercion", (value) => {
    const descriptor = { ...item, field: { ...item.field, value } };
    expect(
      descriptorSchema.parse(JSON.parse(JSON.stringify(descriptor))).field
        .value,
    ).toEqual(value);
  });
  it("rejects hidden values attached to missingness", () => {
    expect(
      descriptorSchema.safeParse({
        ...item,
        field: { ...item.field, value: { state: "withheld", amount: 12 } },
      }).success,
    ).toBe(false);
  });
  it.each(["recording", "statement", "purchase"] as const)(
    "renders a supplied %s through the existing contract",
    (kind) => {
      const input = page();
      input.items = [{ ...item, ref: { ...item.ref, kind } }];
      input.selection = [];
      const result = toCollectionComponent(input);
      expect(componentSchema.safeParse(result).success).toBe(true);
      expect(result.rows[0].values.basis).toContain("population scope");
    },
  );
  it("keeps filtered population counts distinct from page scope", () => {
    const view = getCatalogExplorerView(fixture, {
      query: "",
      cohort: "all",
      descending: false,
      page: 2,
    });
    expect(view.descriptors.items).toHaveLength(25);
    expect(view.descriptors.knownTotal).toBe(10000);
    expect(view.descriptors.aggregationScope).toBe("page");
    expect(view.descriptors.completeness).toBe("partial");
    expect(view.descriptors.nextCursor).toBe("fixture-page:3");
    expect(
      collectionResultSchema.safeParse({
        ...view.descriptors,
        aggregationScope: "population",
      }).success,
    ).toBe(false);
    expect(componentSchema.safeParse(view.collection).success).toBe(true);
  });
  it("does not turn unknown totals into zero", () => {
    const result = toCollectionComponent({
      ...page(),
      knownTotal: null,
      completeness: "partial",
      aggregationScope: "page",
    });
    expect(result.totalCount).toBeUndefined();
    expect(result.complete).toBe(false);
  });
  it.each([
    { hasMore: true, nextCursor: null },
    { knownTotal: 0 },
    { workspaceId: "other" },
    { selection: [{ ...item.ref, workspaceId: "other" }] },
    { items: [item, item] },
  ])("rejects contradictory page metadata", (change) => {
    expect(
      collectionResultSchema.safeParse({ ...page(), ...change }).success,
    ).toBe(false);
  });
  it.each([
    "cohort",
    "sourceVersion",
    "metric",
    "unit",
    "currency",
    "periodStart",
    "periodEnd",
    "territory",
  ] as const)("retains comparison refusal on incompatible %s", (key) => {
    const a = fixture[5],
      b = {
        ...fixture[10],
        [key]: key.startsWith("period") ? "2026-08-01" : "different",
      };
    expect(compareCatalogSelection([a, b]).distribution).toBeNull();
  });
});

it("retains subject row binding and visible provenance across order and pages", () => {
  const a = describeCatalogRecord(fixture[5]),
    b = describeCatalogRecord(fixture[10]);
  const input = { ...page(), items: [a, b], knownTotal: 2 };
  const first = toCollectionComponent(input),
    reordered = toCollectionComponent({ ...input, items: [b, a] });
  expect(first.rows[0].id).toBe(reordered.rows[1].id);
  expect(first.rows[0].id).not.toBe(reordered.rows[0].id);
  expect(first.rows[0].values.identity).toContain(a.ref.id);
  expect(first.rows[0].values.sources).toBe(a.ref.sourceVersionIds.join(", "));
  expect(first.rows[0].values.basis).toContain(a.field.basis);
  expect(
    collectionResultSchema.safeParse({
      ...input,
      items: [
        a,
        { ...a, ref: { ...a.ref, sourceVersionIds: ["new-version"] } },
      ],
    }).success,
  ).toBe(false);
});
