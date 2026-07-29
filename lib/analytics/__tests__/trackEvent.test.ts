import { describe, it, expect, vi, beforeEach } from "vitest";
import { track } from "@vercel/analytics";
import trackEvent from "@/lib/analytics/trackEvent";

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(),
}));

describe("trackEvent", () => {
  beforeEach(() => {
    vi.mocked(track).mockReset();
  });

  it("forwards the event name and props to @vercel/analytics track", () => {
    trackEvent("signup_started", { source: "menu" });

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("signup_started", { source: "menu" });
  });

  it("forwards the event name alone when no props are given", () => {
    trackEvent("checkout_opened");

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith("checkout_opened", undefined);
  });

  it("never throws when track throws", () => {
    vi.mocked(track).mockImplementation(() => {
      throw new Error("analytics unavailable");
    });

    expect(() => trackEvent("signup_completed", { is_new_user: true })).not.toThrow();
  });
});
