// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import SetupTasksPage from "@/app/setup/tasks/page";
const { run } = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock("@/components/Onboarding/FirstTaskStep", () => ({
  default: () => {
    run();
    return <div>Legacy setup</div>;
  },
}));
vi.mock("@/components/Onboarding/CatalogTaskSetup", () => ({
  default: ({ catalogId }: { catalogId: unknown }) => (
    <div>Catalog guard: {JSON.stringify(catalogId)}</div>
  ),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("setup task entry boundary", () => {
  it("preserves direct setup", async () => {
    render(await SetupTasksPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByText("Legacy setup")).toBeTruthy();
  });
  it.each(["catalog-two", "", "unknown", ["one", "two"]])(
    "never mounts pre-run for an explicit catalog %j",
    async (catalogId) => {
      render(
        await SetupTasksPage({ searchParams: Promise.resolve({ catalogId }) }),
      );
      expect(screen.getByText(/Catalog guard/)).toBeTruthy();
      expect(run).not.toHaveBeenCalled();
    },
  );
});
