// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Sidebar from "../Sidebar";

vi.mock("../Menu", () => ({
  default: ({ isExpanded }: { isExpanded: boolean }) => (
    <button>{isExpanded ? "Expanded menu" : "Collapsed menu"}</button>
  ),
}));
vi.mock("@/components/AccountModal", () => ({ default: () => null }));
vi.mock("@/components/Organization/OrgSettingsModal", () => ({ default: () => null }));
vi.mock("@/components/Organization/CreateOrgModal", () => ({ default: () => null }));

afterEach(cleanup);

describe("Sidebar", () => {
  it("expands on hover without changing the reserved rail width", () => {
    render(<Sidebar />);
    const rail = screen.getByRole("complementary", { name: "Main navigation" });
    expect(screen.getByText("Collapsed menu")).toBeDefined();
    fireEvent.mouseEnter(rail);
    expect(screen.getByText("Expanded menu")).toBeDefined();
    expect(rail.parentElement?.classList.contains("w-14")).toBe(true);
    fireEvent.mouseLeave(rail);
    expect(screen.getByText("Collapsed menu")).toBeDefined();
  });

  it("stays open for keyboard navigation after the pointer leaves", () => {
    render(<Sidebar />);
    const rail = screen.getByRole("complementary", { name: "Main navigation" });
    fireEvent.focus(screen.getByRole("button"));
    fireEvent.mouseLeave(rail);
    expect(screen.getByText("Expanded menu")).toBeDefined();
    fireEvent.blur(screen.getByRole("button"), { relatedTarget: document.body });
    expect(screen.getByText("Collapsed menu")).toBeDefined();
  });
});
