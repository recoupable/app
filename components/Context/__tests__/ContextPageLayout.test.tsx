// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ContextPageLayout from "../ContextPageLayout";

const state = vi.hoisted(() => ({ pathname: "/labs/intelligent-ui" }));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/components/Logo/Logo", () => ({
  default: () => <span>Recoup logo</span>,
}));
const Workspace = vi.fn(() => <div>Private workspace</div>);

beforeEach(() => {
  state.pathname = "/labs/intelligent-ui";
  Workspace.mockClear();
});
afterEach(cleanup);

function renderLayout() {
  return render(
    <ContextPageLayout workspace={<Workspace />}>
      Synthetic surface
    </ContextPageLayout>,
  );
}

describe("playground chrome isolation", () => {
  it("does not mount private workspace chrome around synthetic examples", () => {
    renderLayout();
    expect(screen.getByText("Synthetic surface")).toBeTruthy();
    expect(Workspace).not.toHaveBeenCalled();
    expect(screen.queryByRole("banner")).toBeNull();
  });

  it.each([
    "/",
    "/artists",
    "/labs/other",
    "/labs/intelligent-ui/private",
    "/labs/intelligent-ui-extra",
  ])("retains private chrome at %s", (pathname) => {
    state.pathname = pathname;
    renderLayout();
    expect(screen.getByText("Private workspace")).toBeTruthy();
    expect(Workspace).toHaveBeenCalled();
    expect(screen.queryByText("Synthetic surface")).toBeNull();
  });

  it.each(["/context", "/oauth/authorize"])(
    "preserves the existing public layout at %s",
    (pathname) => {
      state.pathname = pathname;
      renderLayout();
      expect(screen.getByText("Synthetic surface")).toBeTruthy();
      expect(screen.getByRole("banner")).toBeTruthy();
      expect(Workspace).not.toHaveBeenCalled();
    },
  );
});
