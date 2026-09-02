import { describe, expect, it } from "vitest";
import {
  WORKSPACE_SETUP_MESSAGES,
  WORKSPACE_SETUP_CYCLE_MS,
} from "@/lib/chat/workspaceSetupMessages";

describe("WORKSPACE_SETUP_MESSAGES", () => {
  it("opens with the verified initial frame", () => {
    expect(WORKSPACE_SETUP_MESSAGES[0]).toBe("Setting up your workspace");
  });

  it("has between five and ten options, all distinct", () => {
    expect(WORKSPACE_SETUP_MESSAGES.length).toBeGreaterThanOrEqual(5);
    expect(WORKSPACE_SETUP_MESSAGES.length).toBeLessThanOrEqual(10);
    expect(new Set(WORKSPACE_SETUP_MESSAGES).size).toBe(WORKSPACE_SETUP_MESSAGES.length);
  });

  it("cycles every 3 to 5 seconds", () => {
    expect(WORKSPACE_SETUP_CYCLE_MS).toBeGreaterThanOrEqual(3000);
    expect(WORKSPACE_SETUP_CYCLE_MS).toBeLessThanOrEqual(5000);
  });

  // Product copy rule: no em or en dashes.
  it("contains no em or en dashes", () => {
    for (const m of WORKSPACE_SETUP_MESSAGES) expect(m).not.toMatch(/[–—]/);
  });
});
