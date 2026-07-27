import { describe, expect, it } from "vitest";
import nextConfig from "@/next.config.mjs";

/**
 * The interim `/onboarding/*` mounts (chat#1880) were dev scaffolding for
 * testing the steps before the sequence container existed. They are retired
 * into the canonical `/setup/*` sequence (chat#1889).
 *
 * These live in `redirects()` rather than as `redirect()` page components so
 * they resolve as real 308s at the edge — a prerendered page shipping the
 * redirect in its RSC payload returns HTTP 200 to any non-JS client (crawler,
 * link previewer, curl), which defeats the point of keeping the old URL alive.
 */
describe("next.config redirects", () => {
  const getRedirects = async () => {
    const config = nextConfig as { redirects?: () => Promise<unknown[]> };
    expect(typeof config.redirects).toBe("function");
    return (await config.redirects!()) as Array<{
      source: string;
      destination: string;
      permanent: boolean;
    }>;
  };

  it("retires /onboarding/first-task into /setup/tasks", async () => {
    const rule = (await getRedirects()).find(
      (r) => r.source === "/onboarding/first-task",
    );

    expect(rule).toBeDefined();
    expect(rule?.destination).toBe("/setup/tasks");
    expect(rule?.permanent).toBe(true);
  });

  it("retires /onboarding/roster into /setup/artists", async () => {
    const rule = (await getRedirects()).find(
      (r) => r.source === "/onboarding/roster",
    );

    expect(rule).toBeDefined();
    expect(rule?.destination).toBe("/setup/artists");
    expect(rule?.permanent).toBe(true);
  });

  it("never sends a retired onboarding mount to the home surface", async () => {
    // Home renders the placeholder step cards while onboarding is incomplete,
    // so routing a funnel arrival there drops them out of the sequence.
    const onboardingRules = (await getRedirects()).filter((r) =>
      r.source.startsWith("/onboarding"),
    );

    expect(onboardingRules.length).toBeGreaterThan(0);
    for (const rule of onboardingRules) {
      expect(rule.destination).not.toBe("/");
      expect(rule.destination).toMatch(/^\/setup\//);
    }
  });
});
