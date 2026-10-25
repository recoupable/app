// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CatalogTaskSetup from "../CatalogTaskSetup";
const { state, retry } = vi.hoisted(() => ({
  state: { value: "unsupported", catalogName: "Second catalog" },
  retry: vi.fn(),
}));
vi.mock("@/hooks/useCatalogTaskSetup", () => ({
  useCatalogTaskSetup: () => ({
    state: state.value,
    catalogName: state.catalogName,
    retry,
  }),
}));
vi.mock("next/link", () => ({
  default: (props: React.ComponentProps<"a">) => <a {...props} />,
}));
afterEach(cleanup);
describe("catalog task setup", () => {
  it("explains unsupported exact-catalog execution without a run or schedule control", () => {
    state.value = "unsupported";
    render(<CatalogTaskSetup catalogId="second" />);
    expect(screen.getByText(/Second catalog/)).toBeTruthy();
    expect(screen.getByText(/No report has been run/)).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /run|schedule|Monday/i }),
    ).toBeNull();
    expect(screen.queryByRole("link", { name: /artist/i })).toBeNull();
  });
  it.each(["invalid", "missing", "workspace", "sign-in", "loading"])(
    "shows %s without fallback",
    (value) => {
      state.value = value;
      render(<CatalogTaskSetup catalogId="second" />);
      expect(screen.queryByText(/Second catalog/)).toBeNull();
      expect(screen.queryByText(/Generating/)).toBeNull();
    },
  );
  it("offers an explicit retry after a failed access read", () => {
    state.value = "error";
    render(<CatalogTaskSetup catalogId="second" />);
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
