// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TasksPage from "@/components/TasksPage/TasksPage";

vi.mock("@/components/TasksPage/TasksTabs", () => ({
  default: () => <div>tabs</div>,
}));
vi.mock("@/components/TasksPage/TasksPageHeader", () => ({
  TasksPageHeader: () => <div>header</div>,
}));

describe("TasksPage", () => {
  it("lets PageContainer own the width and padding so the list is centered in the full panel (app#2016 item 3)", () => {
    render(<TasksPage />);
    const container = screen.getByText("tabs").parentElement as HTMLElement;
    expect(container.className).toContain("max-w-2xl");
    const wrapper = container.parentElement as HTMLElement;
    expect(wrapper.className).not.toMatch(/max-w-\[/);
    expect(wrapper.className).not.toMatch(/\bpx-/);
  });
});
