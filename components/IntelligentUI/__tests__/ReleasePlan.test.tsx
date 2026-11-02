// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReleasePlanLab from "../ReleasePlanLab";
import ReleasePlanEditor from "../ReleasePlanEditor";
import { createReleasePlanFixture } from "@/lib/intelligent-ui/playground/release-plan/createReleasePlanFixture";
import { getReleasePlanKey } from "@/lib/intelligent-ui/playground/release-plan/getReleasePlanKey";
import { readReleasePlan } from "@/lib/intelligent-ui/playground/release-plan/readReleasePlan";
import { saveReleasePlan } from "@/lib/intelligent-ui/playground/release-plan/saveReleasePlan";

beforeEach(() => {
  sessionStorage.clear();
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  vi.stubEnv("VERCEL_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
const change = (name: string, value: string) =>
  fireEvent.change(screen.getByLabelText(name), { target: { value } });
const review = () =>
  fireEvent.click(screen.getByRole("button", { name: "Review local changes" }));
const save = () =>
  fireEvent.click(screen.getByRole("button", { name: "Save local version" }));

describe("local release plan editor", () => {
  it("requires review before saving, invalidates review on edit and restores exact saved edits after remount", () => {
    const view = render(<ReleasePlanLab />);
    expect(
      screen.queryByRole("button", { name: "Save local version" }),
    ).toBeNull();
    change("Release date", "2026-12-11");
    change("IANA timezone", "Europe/London");
    expect(sessionStorage.length).toBe(0);
    review();
    expect(
      screen.getByRole("region", { name: "Proposed local version" })
        .textContent,
    ).toContain("2026-11-20 → 2026-12-11");
    change("Goal", "Review missing artwork locally.");
    expect(
      screen.queryByRole("button", { name: "Save local version" }),
    ).toBeNull();
    review();
    save();
    expect(screen.getByRole("status").textContent).toContain(
      "Saved local version 1",
    );
    view.unmount();
    render(<ReleasePlanLab />);
    expect(
      (screen.getByLabelText("Release date") as HTMLInputElement).value,
    ).toBe("2026-12-11");
    expect(
      (screen.getByLabelText("IANA timezone") as HTMLInputElement).value,
    ).toBe("Europe/London");
    expect((screen.getByLabelText("Goal") as HTMLInputElement).value).toBe(
      "Review missing artwork locally.",
    );
    expect(screen.getByRole("status").textContent).toContain(
      "Restored local version 1",
    );
    review();
    save();
    expect(screen.getByRole("status").textContent).toContain(
      "Already saved as local version 1",
    );
  });
  it("returns keyboard focus to review after both successful and failed saves", () => {
    render(<ReleasePlanLab />);
    review();
    const first = screen.getByRole("button", { name: "Save local version" });
    first.focus();
    fireEvent.click(first);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Review local changes" }),
    );
    change("Goal", "Changed goal");
    review();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("quota");
    });
    const second = screen.getByRole("button", { name: "Save local version" });
    second.focus();
    fireEvent.click(second);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Review local changes" }),
    );
    expect(screen.getByRole("status").textContent).toBe("quota");
  });
  it("retains manual dates, shows dependency conflicts, blocks save and recovers when cleared", () => {
    render(<ReleasePlanLab />);
    const task = within(
      screen.getByRole("group", {
        name: "Review Daybreak materials · pending",
      }),
    );
    fireEvent.change(task.getByLabelText("Manual date (optional)"), {
      target: { value: "2026-11-08" },
    });
    change("Release date", "2026-11-27");
    expect(screen.getByRole("alert").textContent).toContain(
      "before its dependency",
    );
    expect(
      screen.getByText("Manual date retained. Offset proposes 2026-11-15."),
    ).toBeTruthy();
    review();
    expect(
      (
        screen.getByRole("button", {
          name: "Save local version",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.change(task.getByLabelText("Manual date (optional)"), {
      target: { value: "" },
    });
    review();
    save();
    expect(screen.getByRole("status").textContent).toContain(
      "Saved local version 1",
    );
  });
  it("rejects cycles, invalid zones and empty offsets while keeping a readable fallback", () => {
    render(<ReleasePlanLab />);
    const docs = within(
      screen.getByRole("group", {
        name: "Confirm Daybreak contributors and check artwork · pending",
      }),
    );
    fireEvent.change(docs.getByLabelText("Count from"), {
      target: { value: "review" },
    });
    expect(screen.getByRole("alert").textContent).toContain("cycle");
    expect(
      (
        screen.getByRole("button", {
          name: "Review local changes",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.getByText(/Last valid saved plan/)).toBeTruthy();
    fireEvent.change(docs.getByLabelText("Count from"), {
      target: { value: "release" },
    });
    change("IANA timezone", "Mars/Olympus");
    expect(screen.getByRole("alert").textContent).toContain("IANA timezone");
    change("IANA timezone", "UTC");
    fireEvent.change(docs.getByLabelText("Calendar-day offset"), {
      target: { value: "" },
    });
    expect(
      (
        screen.getByRole("button", {
          name: "Review local changes",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });
  it("refuses stale reviewed saves and explicitly reloads without silently overwriting edits", () => {
    const fixture = createReleasePlanFixture();
    render(<ReleasePlanLab />);
    change("Goal", "My working goal");
    review();
    saveReleasePlan(
      sessionStorage,
      fixture,
      readReleasePlan(sessionStorage, fixture),
      { ...fixture.initial, goal: "Other saved goal" },
    );
    save();
    expect(screen.getByRole("status").textContent).toContain(
      "newer or changed",
    );
    expect((screen.getByLabelText("Goal") as HTMLInputElement).value).toBe(
      "My working goal",
    );
    expect(
      screen.queryByRole("button", { name: "Save local version" }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Reload saved version (discard working edits)",
      }),
    );
    expect((screen.getByLabelText("Goal") as HTMLInputElement).value).toBe(
      "Other saved goal",
    );
  });
  it("preserves invalid storage and allows text-only planning when storage is unavailable", () => {
    const fixture = createReleasePlanFixture();
    sessionStorage.setItem(getReleasePlanKey(fixture.scope), "{bad");
    const view = render(<ReleasePlanLab />);
    expect(screen.getByRole("status").textContent).toContain(
      "unavailable or invalid",
    );
    change("Goal", "Still editable");
    review();
    expect(
      (
        screen.getByRole("button", {
          name: "Save local version",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(sessionStorage.getItem(getReleasePlanKey(fixture.scope))).toBe(
      "{bad",
    );
    view.unmount();
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw Error("denied");
    });
    render(<ReleasePlanLab />);
    change("Release date", "2026-12-25");
    expect(
      screen.getByText(/Release date: 2026-12-25; timezone:/),
    ).toBeTruthy();
  });
  it("keeps edits after a write failure and does not announce a saved version", () => {
    render(<ReleasePlanLab />);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("Storage quota reached");
    });
    change("Goal", "Keep this edit");
    review();
    save();
    expect(screen.getByRole("status").textContent).toBe(
      "Storage quota reached",
    );
    expect((screen.getByLabelText("Goal") as HTMLInputElement).value).toBe(
      "Keep this edit",
    );
    expect(sessionStorage.length).toBe(0);
  });
  it("isolates keyed fixture scopes and discards unsaved edits on leaving", () => {
    const fixture = createReleasePlanFixture();
    const other = {
      ...fixture,
      scope: { ...fixture.scope, releaseId: "other-synthetic-release" },
    };
    const view = render(
      <ReleasePlanEditor
        key={getReleasePlanKey(fixture.scope)}
        fixture={fixture}
      />,
    );
    change("Goal", "Saved for Night Swimming");
    review();
    save();
    change("Goal", "Unsaved edit");
    view.rerender(
      <ReleasePlanEditor
        key={getReleasePlanKey(other.scope)}
        fixture={other}
      />,
    );
    expect((screen.getByLabelText("Goal") as HTMLInputElement).value).toBe(
      fixture.initial.goal,
    );
    view.rerender(
      <ReleasePlanEditor
        key={getReleasePlanKey(fixture.scope)}
        fixture={fixture}
      />,
    );
    expect((screen.getByLabelText("Goal") as HTMLInputElement).value).toBe(
      "Saved for Night Swimming",
    );
  });
  it.each(["NODE_ENV", "VERCEL_ENV", "NEXT_PUBLIC_VERCEL_ENV"])(
    "does not mount storage or editor in production via %s",
    (name) => {
      vi.stubEnv(name, "production");
      const spy = vi.spyOn(Storage.prototype, "getItem");
      render(<ReleasePlanLab />);
      expect(
        screen.queryByRole("region", { name: "Local release plan" }),
      ).toBeNull();
      expect(spy).not.toHaveBeenCalled();
    },
  );
  it("requires explicit opt-in", () => {
    vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "false");
    render(<ReleasePlanLab />);
    expect(
      screen.queryByRole("region", { name: "Local release plan" }),
    ).toBeNull();
  });
});
