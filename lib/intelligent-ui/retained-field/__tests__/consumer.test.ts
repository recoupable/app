import { describe, expect, it } from "vitest";
import { fitsRetainedFieldBudget } from "../fitsRetainedFieldBudget";
import { consumeRetainedField } from "../consumeRetainedField";
import { projectRetainedField } from "../projectRetainedField";
import { fieldContextSchema } from "../schemas";
import { surfaceSchema } from "../../schema";
import { objectRefKey } from "../../descriptors/objectRefKey";
import { fixture } from "./fixture";
import { id } from "./id";
import { resolveSelection } from "../../descriptors/resolveSelection";

describe("offline retained field consumer", () => {
  it("defaults unavailable and does not extend schema-v1", () => {
    const { part } = fixture();
    expect(consumeRetainedField(part)).toEqual({ state: "unavailable" });
    expect(
      surfaceSchema.safeParse({
        ...part.data.surface,
        fieldContext: part.data.fieldContext,
      }).success,
    ).toBe(false);
  });
  it("roundtrips exact refs, zero/unknown, both periods and deterministic text", () => {
    const { part, admission } = fixture();
    const result = consumeRetainedField(
      JSON.parse(JSON.stringify(part)),
      admission,
    );
    expect(result.state).toBe("ready");
    if (result.state !== "ready") throw new Error("Expected fixture admission");
    expect(result.descriptors.size).toBe(2);
    expect(result.collection.selection).toEqual(
      part.data.fieldContext.items.map((item) => item.ref),
    );
    for (const item of part.data.fieldContext.items) {
      const descriptor = result.descriptors.get(objectRefKey(item.ref));
      expect(descriptor?.ref).toEqual(item.ref);
      expect(descriptor?.field.value).toEqual(item.value);
      expect(descriptor?.label).toBe(item.binding.subjectId);
    }
    expect(result.collection.items[0].field.periodEnd).toBe("2026-10-02");
    expect(result.text).toContain("0 streams");
    expect(result.text).toContain("unknown");
    expect(result.text).toContain("Previous period [2026-09-29, 2026-10-01)");
    expect(result.text).toContain("current period [2026-10-01, 2026-10-03)");
    expect(result.text).toContain("not provider freshness");
    expect(result.fieldContext).toEqual(part.data.fieldContext);
    expect(result.collection).toMatchObject({
      completeness: "partial",
      aggregationScope: "page",
      knownTotal: null,
      hasMore: false,
      nextCursor: null,
    });
    expect(result.surface.fallbackText).toBe(result.text);
  });
  const mutations: [string, (f: ReturnType<typeof fixture>) => void][] = [
    [
      "result",
      (f) => {
        f.part.data.fieldContext.items[0].binding.resultId = id(99);
      },
    ],
    [
      "request",
      (f) => {
        f.part.data.fieldContext.items[0].binding.requestId = id(99);
      },
    ],
    [
      "revision",
      (f) => {
        f.part.data.fieldContext.items[0].binding.revision++;
      },
    ],
    [
      "owner",
      (f) => {
        f.part.data.fieldContext.items[0].binding.ownerId = id(99);
      },
    ],
    [
      "catalog",
      (f) => {
        f.part.data.fieldContext.items[0].binding.catalogId = id(99);
      },
    ],
    [
      "ref-version",
      (f) => {
        f.part.data.fieldContext.items[0].ref.sourceVersionIds = [id(99)];
      },
    ],
    [
      "full-version",
      (f) => {
        f.part.data.fieldContext.items[0].ref.sourceVersionIds = [id(99)];
        f.part.data.fieldContext.items[0].binding.sourceVersionIds = [id(99)];
      },
    ],
    [
      "subject",
      (f) => {
        f.part.data.fieldContext.items[0].ref.id = id(99);
      },
    ],
    [
      "order",
      (f) => {
        f.part.data.fieldContext.items.reverse();
      },
    ],
    [
      "duplicate",
      (f) => {
        f.part.data.fieldContext.items[1] = structuredClone(
          f.part.data.fieldContext.items[0],
        );
      },
    ],
    [
      "query",
      (f) => {
        f.part.data.fieldContext.query.days = 3;
      },
    ],
    [
      "previous-period",
      (f) => {
        f.part.data.fieldContext.items[0].periods.previous.start = "2026-09-28";
      },
    ],
    [
      "current-period",
      (f) => {
        f.part.data.fieldContext.items[0].periods.current.end_exclusive =
          "2026-10-04";
      },
    ],
    [
      "incomplete-known",
      (f) => {
        f.part.data.fieldContext.items[0].coverage.comparisonState =
          "incomplete";
      },
    ],
    [
      "negative-count",
      (f) => {
        f.part.data.fieldContext.items[0].coverage.nullDateCount = -1;
      },
    ],
    [
      "negative-value",
      (f) => {
        f.part.data.fieldContext.items[0].value = {
          state: "known",
          amount: -1,
        };
      },
    ],
    [
      "unsafe-value",
      (f) => {
        f.part.data.fieldContext.items[0].value = {
          state: "known",
          amount: 2 ** 53,
        };
      },
    ],
    [
      "retrieval-order",
      (f) => {
        f.part.data.fieldContext.items[0].source.retrievalRange.earliest =
          "2026-10-05T00:00:00Z";
      },
    ],
    [
      "text",
      (f) => {
        f.part.data.surface.fallbackText += " 999999 streams";
      },
    ],
    [
      "label",
      (f) => {
        f.part.data.surface.title = "Current verified values";
      },
    ],
    [
      "missing-row",
      (f) => {
        f.part.data.surface.components = [];
      },
    ],
    [
      "wrong-surface",
      (f) => {
        f.admission.surfaceId = "other";
      },
    ],
    [
      "surface-revision",
      (f) => {
        f.admission.surfaceRevision++;
      },
    ],
    [
      "generation",
      (f) => {
        f.admission.currentScope.generation++;
      },
    ],
    [
      "account",
      (f) => {
        f.admission.currentScope.accountId = id(99);
      },
    ],
    [
      "workspace",
      (f) => {
        f.admission.currentScope.workspaceId = id(99);
      },
    ],
    [
      "session",
      (f) => {
        f.admission.currentScope.sessionId = id(99);
      },
    ],
    [
      "chat",
      (f) => {
        f.admission.currentScope.chatId = id(99);
      },
    ],
    [
      "message",
      (f) => {
        f.admission.currentScope.messageId = id(99);
      },
    ],
  ];
  it.each(mutations)(
    "withholds companion AND values/text for %s mismatch",
    (_label, mutate) => {
      const f = fixture();
      mutate(f);
      expect(consumeRetainedField(f.part, f.admission)).toEqual({
        state: "unavailable",
      });
    },
  );
  it.each(["unavailable", "error"] as const)(
    "does not reuse a prior result on %s disclosure",
    (disclosure) => {
      const f = fixture();
      expect(consumeRetainedField(f.part, f.admission).state).toBe("ready");
      expect(
        consumeRetainedField(f.part, { ...f.admission, disclosure }),
      ).toEqual({ state: "unavailable" });
    },
  );
  it("rejects unknown keys at envelope, context, item and method boundaries", () => {
    const f = fixture();
    const candidates = [
      { ...f.part, unexpected: true },
      { ...f.part, data: { ...f.part.data, unexpected: true } },
      {
        ...f.part,
        data: {
          ...f.part.data,
          fieldContext: { ...f.part.data.fieldContext, state: "ready" },
        },
      },
      {
        ...f.part,
        data: {
          ...f.part.data,
          fieldContext: {
            ...f.part.data.fieldContext,
            method: {
              ...f.part.data.fieldContext.method,
              url: "https://example.invalid",
            },
          },
        },
      },
      {
        ...f.part,
        data: {
          ...f.part.data,
          fieldContext: {
            ...f.part.data.fieldContext,
            items: [
              { ...f.part.data.fieldContext.items[0], rawEvidence: "private" },
            ],
          },
        },
      },
    ];
    for (const input of candidates)
      expect(consumeRetainedField(input, f.admission)).toEqual({
        state: "unavailable",
      });
  });
  it("rejects a changed registered method even when request and response agree", () => {
    const f = fixture();
    const method = {
      ...f.part.data.fieldContext.method,
      evaluatorSha256: "f".repeat(64),
    };
    const part = {
      ...f.part,
      data: {
        ...f.part.data,
        fieldContext: { ...f.part.data.fieldContext, method },
      },
    };
    expect(consumeRetainedField(f.part, f.admission).state).toBe("ready");
    const admission = {
      ...f.admission,
      request: { ...f.admission.request, method },
    };
    // The changed literal is intentionally invalid on both sides of this input.
    expect(consumeRetainedField(part, admission as typeof f.admission)).toEqual(
      { state: "unavailable" },
    );
  });
  it("directly refuses the UTF-8 budget of an oversized part (separate from strict unknown-key rejection)", () => {
    const f = fixture();
    const oversized = { ...f.part, padding: "界".repeat(90000) };
    expect(fitsRetainedFieldBudget("part", f.part)).toBe(true);
    expect(fitsRetainedFieldBudget("part", oversized)).toBe(false);
    expect(consumeRetainedField(oversized, f.admission)).toEqual({
      state: "unavailable",
    });
  });
  it("rejects amount attached to unknown, more than eight items and two source versions", () => {
    const f = fixture();
    const context = f.part.data.fieldContext;
    expect(
      fieldContextSchema.safeParse({
        ...context,
        items: [
          { ...context.items[0], value: { state: "unknown", amount: 0 } },
        ],
      }).success,
    ).toBe(false);
    expect(
      fieldContextSchema.safeParse({
        ...context,
        items: Array(9).fill(context.items[0]),
      }).success,
    ).toBe(false);
    expect(
      fieldContextSchema.safeParse({
        ...context,
        items: [
          {
            ...context.items[0],
            binding: {
              ...context.items[0].binding,
              sourceVersionIds: [id(30), id(31)],
            },
          },
        ],
      }).success,
    ).toBe(false);
  });
  it("rejects a changed display amount instead of publishing it as a typed value", () => {
    const f = fixture();
    const component = f.part.data.surface.components[0];
    if (component.type !== "collection") throw new Error("Expected collection");
    const before = consumeRetainedField(f.part, f.admission);
    expect(before.state).toBe("ready");
    if (before.state === "ready")
      expect(before.collection.items[0].field.value).toEqual({
        state: "known",
        amount: 0,
      });
    component.rows[0].values.value = "27 streams";
    expect(consumeRetainedField(f.part, f.admission)).toEqual({
      state: "unavailable",
    });
  });
});

it("joins selections by the full Context ref, never subject ID alone", () => {
  const f = fixture();
  const result = consumeRetainedField(f.part, f.admission);
  if (result.state !== "ready") throw new Error("Expected fixture admission");
  expect(
    resolveSelection(
      f.admission.request.workspaceId,
      result.descriptors,
      result.collection.selection,
    ),
  ).toEqual({ state: "available", items: result.collection.items });
  const changed = {
    ...result.collection.selection[0],
    sourceVersionIds: [id(99)],
  };
  expect(
    resolveSelection(f.admission.request.workspaceId, result.descriptors, [
      changed,
    ]),
  ).toEqual({ state: "unavailable" });
});
it("rejects internally consistent but unrequested period and version substitution", () => {
  for (const mode of ["period", "version"] as const) {
    const f = fixture();
    const context = f.part.data.fieldContext;
    if (mode === "period") {
      context.query.since = "2026-10-02";
      for (const item of context.items) {
        item.periods.previous = {
          start: "2026-09-30",
          end_exclusive: "2026-10-02",
        };
        item.periods.current = {
          start: "2026-10-02",
          end_exclusive: "2026-10-04",
        };
      }
    } else {
      context.items[0].ref.sourceVersionIds = [id(99)];
      context.items[0].binding.sourceVersionIds = [id(99)];
    }
    f.part.data.surface = projectRetainedField(
      context,
      "retained-1",
      1,
    ).surface;
    expect(consumeRetainedField(f.part, f.admission)).toEqual({
      state: "unavailable",
    });
  }
});
it("keeps valid leap-day periods and document revision distinct from surface revision", () => {
  const f = fixture();
  const context = f.part.data.fieldContext;
  context.query = { since: "2024-03-01", days: 1, timezone: "UTC" };
  f.admission.request.query = structuredClone(context.query);
  for (const item of context.items)
    item.periods = {
      previous: { start: "2024-02-29", end_exclusive: "2024-03-01" },
      current: { start: "2024-03-01", end_exclusive: "2024-03-02" },
      days: 1,
      timezone: "UTC",
    };
  f.part.data.surface = projectRetainedField(context, "retained-1", 7).surface;
  f.admission.surfaceRevision = 7;
  const result = consumeRetainedField(f.part, f.admission);
  expect(result.state).toBe("ready");
  if (result.state === "ready") {
    expect(result.fieldContext.items[0].binding.revision).toBe(4);
    expect(result.surface.revision).toBe(7);
  }
});
