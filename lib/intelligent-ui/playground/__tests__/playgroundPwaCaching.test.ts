import { beforeAll, describe, expect, it, vi } from "vitest";

type CachingRule = {
  urlPattern: RegExp;
  handler: string;
  method?: string;
};
const state = vi.hoisted(() => ({
  options: null as { runtimeCaching: CachingRule[] } | null,
}));
vi.mock("next-pwa", () => ({
  default: (options: typeof state.options) => (config: unknown) => {
    state.options = options;
    return config;
  },
}));
beforeAll(async () => {
  await import("../../../../next.config.mjs");
});

describe("playground offline-cache isolation", () => {
  it.each([
    [0, "/labs/intelligent-ui"],
    [1, "/api/intelligent-ui/playground"],
    [2, "/api/intelligent-ui/playground/audio"],
  ] as const)(
    "places an exact NetworkOnly rule before defaults for %s",
    (index, path) => {
      const rule = state.options!.runtimeCaching[index];
      expect(rule.handler).toBe("NetworkOnly");
      expect(rule.method).toBe("GET");
      expect(rule.urlPattern.test(`https://preview.example${path}`)).toBe(true);
      expect(
        rule.urlPattern.test(`https://preview.example${path}?fixture=one`),
      ).toBe(true);
      expect(
        rule.urlPattern.test(`https://preview.example${path}/private`),
      ).toBe(false);
      expect(rule.urlPattern.test(`https://preview.example${path}-other`)).toBe(
        false,
      );
    },
  );

  it("preserves the existing OAuth exclusion", () => {
    const rule = state.options!.runtimeCaching[3];
    expect(rule.handler).toBe("NetworkOnly");
    expect(
      rule.urlPattern.test("https://preview.example/oauth/authorize"),
    ).toBe(true);
  });
});
