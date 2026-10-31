// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { resolveSelection } from "@/lib/intelligent-ui/descriptors/resolveSelection";
import CatalogExplorer from "../CatalogExplorer";
vi.mock(
  "@/lib/intelligent-ui/descriptors/resolveSelection",
  async (importOriginal) => {
    const original =
      await importOriginal<
        typeof import("@/lib/intelligent-ui/descriptors/resolveSelection")
      >();
    return { ...original, resolveSelection: vi.fn(original.resolveSelection) };
  },
);
afterEach(() => {
  cleanup();
  vi.mocked(resolveSelection).mockReset();
});
it.each(["version", "workspace"])(
  "preserves unavailable selection count in UI and text after %s changes",
  (reason) => {
    render(<CatalogExplorer />);
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Select Recording 00005" }),
    );
    const actual = vi.mocked(resolveSelection).getMockImplementation()!;
    vi.mocked(resolveSelection).mockImplementation((workspace, index, refs) => {
      const changed = refs.map((ref) =>
        reason === "workspace"
          ? { ...ref, workspaceId: "other" }
          : { ...ref, sourceVersionIds: ["changed"] },
      );
      return actual(workspace, index, changed);
    });
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    const message =
      "1 selected references are unavailable. Reset the local view to continue.";
    expect(screen.getByText(message, { selector: "p" })).toBeTruthy();
    expect(
      (
        screen.getByRole("textbox", {
          name: "Source-preserving text",
        }) as HTMLTextAreaElement
      ).value,
    ).toBe(message);
    expect(screen.queryByRole("figure")).toBeNull();
  },
);
