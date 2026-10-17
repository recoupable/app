import { afterEach, describe, expect, it, vi } from "vitest";
import { isPlaygroundEnabled } from "../isPlaygroundEnabled";

afterEach(() => vi.unstubAllEnvs());

describe("playground availability", () => {
  it.each([
    ["development", undefined, undefined, true],
    ["development", "development", "false", true],
    ["development", "production", "true", false],
    ["production", "production", "true", false],
    ["production", "preview", "true", true],
    ["production", "preview", undefined, false],
    ["production", "preview", "false", false],
    ["production", "preview", "1", false],
    ["production", undefined, "true", false],
    ["production", "development", "true", false],
    ["test", "preview", "true", false],
  ] as const)(
    "NODE_ENV=%s VERCEL_ENV=%s flag=%s yields %s",
    (nodeEnv, vercelEnv, enabled, expected) => {
      vi.stubEnv("NODE_ENV", nodeEnv);
      vi.stubEnv("VERCEL_ENV", vercelEnv);
      vi.stubEnv("RECOUP_INTELLIGENT_UI_PLAYGROUND", enabled);
      expect(isPlaygroundEnabled()).toBe(expected);
    },
  );
});
