import { beforeEach, describe, expect, it, vi } from "vitest";
import { track } from "@vercel/analytics";
import { trackEvent } from "@/lib/analytics/trackEvent";

vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));

describe("trackEvent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("forwards the name and the properties to Vercel Web Analytics", () => {
    trackEvent("upgrade_prompt_shown", { trigger: "credits_low" });
    expect(track).toHaveBeenCalledWith("upgrade_prompt_shown", { trigger: "credits_low" });
  });

  it("never throws when the analytics script is unavailable", () => {
    vi.mocked(track).mockImplementationOnce(() => {
      throw new Error("no script");
    });
    expect(() => trackEvent("upgrade_prompt_shown", {})).not.toThrow();
  });
});
