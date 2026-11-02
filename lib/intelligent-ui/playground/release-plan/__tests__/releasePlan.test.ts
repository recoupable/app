import { describe, expect, it, vi } from "vitest";
import { calendarDate } from "../calendarDate";
import { createReleasePlanFixture } from "../createReleasePlanFixture";
import { resolveReleasePlan } from "../resolveReleasePlan";
import { getReleasePlanDiff } from "../getReleasePlanDiff";
import { getReleasePlanKey } from "../getReleasePlanKey";
import { readReleasePlan } from "../readReleasePlan";
import { saveReleasePlan } from "../saveReleasePlan";
import { getReleasePlanText } from "../getReleasePlanText";
import type { PlanStorage } from "../types";

function setup() {
  const values = new Map<string, string>();
  const storage: PlanStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: vi.fn((key, value) => {
      values.set(key, value);
    }),
  };
  const fixture = createReleasePlanFixture();
  return { values, storage, fixture, base: readReleasePlan(storage, fixture) };
}

describe("date-only release planning", () => {
  it.each([
    ["2026-03-08", -1, "2026-03-07"],
    ["2026-03-08", 1, "2026-03-09"],
    ["2026-11-01", 1, "2026-11-02"],
    ["2026-12-31", 1, "2027-01-01"],
    ["2027-01-01", -1, "2026-12-31"],
    ["2028-03-01", -1, "2028-02-29"],
    ["2100-03-01", -1, "2100-02-28"],
  ])("moves %s by %i calendar days", (date, offset, expected) => {
    for (const zone of [
      "America/New_York",
      "Pacific/Auckland",
      "Asia/Tokyo",
      "Etc/GMT+5",
      "Etc/GMT-14",
      "UTC",
    ]) {
      const fixture = createReleasePlanFixture();
      fixture.initial.releaseDate = date;
      fixture.initial.timeZone = zone;
      expect(calendarDate(date, offset)).toBe(expected);
      const plan = resolveReleasePlan(fixture.initial);
      expect(plan.tasks[0].date).toBe(calendarDate(date, -14));
      expect(plan.tasks[2].date).toBe(calendarDate(date, -12));
    }
  });
  it.each([
    "2026-02-29",
    "2028-02-30",
    "2026-13-01",
    "2026-01-00",
    "01/02/2026",
    "2026-03-08T00:00:00Z",
    "1899-12-31",
  ])("rejects invalid date %s", (date) =>
    expect(calendarDate(date)).toBeNull(),
  );
  it("bounds computed dates without wrapping beyond the supported calendar", () => {
    const { fixture } = setup();
    fixture.initial.releaseDate = "1900-01-01";
    expect(() => resolveReleasePlan(fixture.initial)).toThrow("outside");
    expect(calendarDate("2100-12-31", 1)).toBeNull();
  });
  it("preserves manual dates and follows their actual date for dependent tasks", () => {
    const { fixture } = setup();
    fixture.initial.tasks[1].manualDate = "2026-11-10";
    const after = { ...fixture.initial, releaseDate: "2026-11-27" };
    const result = resolveReleasePlan(after);
    expect(result.tasks[1]).toMatchObject({
      date: "2026-11-10",
      proposedDate: "2026-11-13",
      manual: true,
    });
    expect(result.tasks[2].date).toBe("2026-11-12");
    expect(result.conflicts).toEqual([]);
    expect(getReleasePlanDiff(fixture.initial, after)).toContain(
      "Collect After Hours artwork date: 2026-11-06 → 2026-11-13",
    );
  });
  it("reports a retained manual date overtaken by its dependency", () => {
    const { fixture } = setup();
    fixture.initial.tasks[2].manualDate = "2026-11-08";
    fixture.initial.releaseDate = "2026-11-27";
    const result = resolveReleasePlan(fixture.initial);
    expect(result.tasks[2].date).toBe("2026-11-08");
    expect(result.conflicts.join()).toContain("before its dependency");
  });
  it("reports tasks after release and negative dependent offsets", () => {
    const { fixture } = setup();
    fixture.initial.tasks[0].manualDate = "2026-12-01";
    fixture.initial.tasks[2].offsetDays = -1;
    expect(resolveReleasePlan(fixture.initial).conflicts).toHaveLength(2);
  });
  it("rejects cycles even when manual dates might otherwise hide them", () => {
    const { fixture } = setup();
    fixture.initial.tasks[1].anchor = "review";
    fixture.initial.tasks[1].manualDate = "2026-11-01";
    expect(() => resolveReleasePlan(fixture.initial)).toThrow("cycle");
    fixture.initial.tasks[1].anchor = "documentation";
    expect(() => resolveReleasePlan(fixture.initial)).toThrow("cycle");
  });
  it("rejects unknown/duplicate/missing tasks and unknown dependencies", () => {
    const { fixture } = setup();
    for (const tasks of [
      [...fixture.initial.tasks.slice(1), fixture.initial.tasks[1]],
      fixture.initial.tasks.slice(1),
      fixture.initial.tasks.map((t, i) =>
        i === 0 ? { ...t, id: "unknown" } : t,
      ),
      fixture.initial.tasks.map((t, i) =>
        i === 0 ? { ...t, anchor: "unknown" } : t,
      ),
    ])
      expect(() => resolveReleasePlan({ ...fixture.initial, tasks })).toThrow();
  });
  it("rejects oversized goals, bad zones, non-integer and excessive offsets", () => {
    const { fixture } = setup();
    for (const timeZone of ["", "+05:00", "EST", "Mars/Olympus"])
      expect(() =>
        resolveReleasePlan({ ...fixture.initial, timeZone }),
      ).toThrow();
    for (const goal of ["", " ", "a".repeat(241)])
      expect(() => resolveReleasePlan({ ...fixture.initial, goal })).toThrow();
    for (const offsetDays of [366, -366, 0.5, NaN, Infinity])
      expect(() =>
        resolveReleasePlan({
          ...fixture.initial,
          tasks: fixture.initial.tasks.map((t) => ({ ...t, offsetDays })),
        }),
      ).toThrow();
  });
  it("diff includes changed rules and manual edits even with unchanged resolved dates", () => {
    const { fixture } = setup();
    const after = structuredClone(fixture.initial);
    after.tasks[0].manualDate = "2026-11-06";
    after.tasks[0].offsetDays = -13;
    after.timeZone = "UTC";
    after.goal = "Review the missing artwork.";
    const diff = getReleasePlanDiff(fixture.initial, after).join("\n");
    expect(diff).toContain("rule:");
    expect(diff).toContain("manual date: none → 2026-11-06");
    expect(diff).toContain("Timezone: America/New_York → UTC");
    expect(diff).toContain("Goal:");
  });
});

describe("isolated versioned local save", () => {
  it("restores exact scope, source revision, version and edits; duplicates do not write", () => {
    const { storage, fixture, base, values } = setup();
    const edits = {
      ...fixture.initial,
      releaseDate: "2026-12-11",
      timeZone: "Europe/London",
      goal: "Prepare a local review.",
    };
    const first = saveReleasePlan(storage, fixture, base, edits);
    expect(first.status).toBe("saved");
    expect(first.base.version).toBe(1);
    expect(readReleasePlan(storage, fixture)).toEqual(first.base);
    expect(
      JSON.parse(values.get(getReleasePlanKey(fixture.scope))!).scope,
    ).toEqual(fixture.scope);
    expect(saveReleasePlan(storage, fixture, base, edits).status).toBe(
      "duplicate",
    );
    expect(saveReleasePlan(storage, fixture, first.base, edits).status).toBe(
      "duplicate",
    );
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });
  it("refuses stale and same-version changed bases without overwriting", () => {
    const { storage, fixture, base, values } = setup();
    const saved = saveReleasePlan(storage, fixture, base, fixture.initial);
    expect(() =>
      saveReleasePlan(storage, fixture, base, {
        ...fixture.initial,
        goal: "Different",
      }),
    ).toThrow("newer or changed");
    const raw = JSON.parse(saved.base.token!);
    raw.edits.goal = "Changed outside this editor";
    values.set(getReleasePlanKey(fixture.scope), JSON.stringify(raw));
    expect(() =>
      saveReleasePlan(storage, fixture, saved.base, {
        ...fixture.initial,
        goal: "Another",
      }),
    ).toThrow("newer or changed");
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });
  it("isolates release/workspace scopes and refuses copied wrong-source records", () => {
    const { storage, fixture, base, values } = setup();
    const saved = saveReleasePlan(storage, fixture, base, fixture.initial);
    for (const scope of [
      { ...fixture.scope, releaseId: "another-release" },
      { ...fixture.scope, workspaceId: "another-workspace" },
    ]) {
      const other = { ...fixture, scope };
      expect(readReleasePlan(storage, other).version).toBe(0);
      values.set(getReleasePlanKey(scope), saved.base.token!);
      expect(() => readReleasePlan(storage, other)).toThrow("does not match");
    }
    const bad = JSON.parse(saved.base.token!);
    bad.scope.sourceRevision = 4;
    values.set(getReleasePlanKey(fixture.scope), JSON.stringify(bad));
    expect(() => readReleasePlan(storage, fixture)).toThrow();
  });
  it("does not overwrite invalid, oversized, future schema or conflicting storage", () => {
    const { storage, fixture, base, values } = setup();
    const saved = saveReleasePlan(storage, fixture, base, fixture.initial);
    const bad = JSON.parse(saved.base.token!);
    bad.edits.tasks[0].manualDate = "2026-12-31";
    for (const raw of [
      "",
      "{bad",
      "x".repeat(12001),
      JSON.stringify({ ...JSON.parse(saved.base.token!), schemaVersion: 2 }),
      JSON.stringify(bad),
    ]) {
      values.set(getReleasePlanKey(fixture.scope), raw);
      expect(() => readReleasePlan(storage, fixture)).toThrow();
      expect(() =>
        saveReleasePlan(storage, fixture, base, fixture.initial),
      ).toThrow();
      expect(values.get(getReleasePlanKey(fixture.scope))).toBe(raw);
    }
    expect(storage.setItem).toHaveBeenCalledTimes(1);
  });
  it("refuses conflicting saves, failed writes and failed readback without a success receipt", () => {
    const { storage, fixture, base } = setup();
    const edits = structuredClone(fixture.initial);
    edits.tasks[0].manualDate = "2026-12-31";
    expect(() => saveReleasePlan(storage, fixture, base, edits)).toThrow(
      "conflicts",
    );
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(() =>
      saveReleasePlan(
        {
          ...storage,
          setItem: () => {
            throw Error("Quota");
          },
        },
        fixture,
        base,
        fixture.initial,
      ),
    ).toThrow("Quota");
    expect(() =>
      saveReleasePlan(
        { getItem: () => null, setItem: () => {} },
        fixture,
        base,
        fixture.initial,
      ),
    ).toThrow("verify");
  });
  it("has no read-time writes and provides a truthful plain text fallback", () => {
    const { storage, fixture } = setup();
    const base = readReleasePlan(storage, fixture);
    expect(storage.setItem).not.toHaveBeenCalled();
    const text = getReleasePlanText(fixture, base.edits, base.version);
    expect(text).toContain("worksheet revision 3");
    expect(
      getReleasePlanText(fixture, { ...base.edits, goal: "Unsaved" }, 1),
    ).toContain("working copy based on local version 1");
    expect(text).toContain("2026-11-20; timezone: America/New_York");
    expect(text.match(/Pending:/g)).toHaveLength(3);
    expect(text).toContain("No tasks approved or executed");
  });
});
