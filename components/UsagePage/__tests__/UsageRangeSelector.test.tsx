// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UsageRangeSelector from "@/components/UsagePage/UsageRangeSelector";

describe("UsageRangeSelector", () => {
  it("offers the six ranges and reports a pick", () => {
    const onChange = vi.fn();
    render(<UsageRangeSelector value="30d" onChange={onChange} />);
    for (const label of ["24h", "7d", "30d", "3m", "12m", "24m"]) {
      expect(screen.getByRole("tab", { name: label })).toBeDefined();
    }
    expect(
      screen.getByRole("tab", { name: "30d" }).getAttribute("data-state"),
    ).toBe("active");
    fireEvent.mouseDown(screen.getByRole("tab", { name: "7d" }));
    fireEvent.click(screen.getByRole("tab", { name: "7d" }));
    expect(onChange).toHaveBeenCalledWith("7d");
  });
});
