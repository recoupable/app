import { afterEach, expect, it, vi } from "vitest";
import { isChatIntelligentUIEnabled } from "../isChatIntelligentUIEnabled";

afterEach(() => vi.unstubAllEnvs());

it.each([
  ["development", "development", "true", true],
  ["development", undefined, undefined, false],
  ["development", "development", "false", false],
  ["development", "production", "true", false],
  ["production", "production", "true", false],
  ["production", "preview", "true", false],
  ["production", undefined, "true", false],
  ["test", "development", "true", false],
] as const)(
  "gates NODE_ENV=%s VERCEL_ENV=%s opt-in=%s => %s",
  (node, vercel, flag, expected) => {
    vi.stubEnv("NODE_ENV", node);
    vi.stubEnv("VERCEL_ENV", vercel);
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", vercel);
    vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", flag);
    expect(isChatIntelligentUIEnabled()).toBe(expected);
  },
);

it("honors the public production marker even when the server-only marker is absent", () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL_ENV", undefined);
  vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "production");
  vi.stubEnv("NEXT_PUBLIC_RECOUP_INTELLIGENT_UI_CHAT", "true");
  expect(isChatIntelligentUIEnabled()).toBe(false);
});
