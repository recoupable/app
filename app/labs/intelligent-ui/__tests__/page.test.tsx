import { afterEach, describe, expect, it, vi } from "vitest";
import IntelligentUIPlaygroundPage from "../page";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
vi.mock("@/components/IntelligentUI/Playground", () => ({
  default: () => null,
}));
afterEach(() => vi.unstubAllEnvs());

describe("playground server page", () => {
  it("blocks production independently of client layout decisions", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("RECOUP_INTELLIGENT_UI_PLAYGROUND", "true");
    expect(() => IntelligentUIPlaygroundPage()).toThrow("NOT_FOUND");
  });
  it("allows local development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "");
    expect(IntelligentUIPlaygroundPage()).toBeTruthy();
  });
});
