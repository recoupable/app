// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

// Tailwind v4's preflight gives <button> cursor: default; a clickable button must show a pointer.
describe("Button", () => {
  it("shows a pointer cursor", () => {
    render(<Button>Configure billing</Button>);
    expect(screen.getByRole("button").className).toContain("cursor-pointer");
  });
});
