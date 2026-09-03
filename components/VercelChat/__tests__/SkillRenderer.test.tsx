// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkillRenderer } from "@/components/VercelChat/tools/agent/SkillRenderer";

const done = { running: false, interrupted: false };

describe("SkillRenderer", () => {
  it("shows the failure reason on expand even when the call had args", () => {
    const { container } = render(
      <SkillRenderer
        input={{ skill: "nope", args: "--fast" }}
        output={{ success: false, error: "Skill 'nope' not found" }}
        state={done}
      />,
    );
    fireEvent.click(container.querySelector('[role="button"]')!);
    expect(screen.getByText("Skill 'nope' not found")).toBeTruthy();
    expect(screen.getByText("--fast")).toBeTruthy();
  });

  it("treats success:false with an empty error as a failure", () => {
    const { container } = render(
      <SkillRenderer
        input={{ skill: "nope" }}
        output={{ success: false, error: "" }}
        state={done}
      />,
    );
    expect(container.querySelector("svg.lucide-circle-x")).toBeTruthy();
  });
});
