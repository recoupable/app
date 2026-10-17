import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

afterEach(() => vi.unstubAllEnvs());

describe("playground request gate", () => {
  it("returns a real no-store 404 before production can stream a page", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("RECOUP_INTELLIGENT_UI_PLAYGROUND", "true");
    const response = proxy(
      new NextRequest("https://example.com/labs/intelligent-ui"),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-middleware-next")).toBeNull();
  });

  it.each([
    "/",
    "/context",
    "/artists",
    "/oauth/authorize",
    "/api/chat",
    "/labs/intelligent-ui-other",
    "/labs/intelligent-ui/child",
  ])("does not change another route: %s", (path) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    expect(
      proxy(new NextRequest(`https://example.com${path}`)).headers.get(
        "x-middleware-next",
      ),
    ).toBe("1");
  });

  it("allows the local lab to reach its independent page gate", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "");
    expect(
      proxy(
        new NextRequest("http://localhost/labs/intelligent-ui"),
      ).headers.get("x-middleware-next"),
    ).toBe("1");
  });

  it("allows an explicitly enabled preview", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("RECOUP_INTELLIGENT_UI_PLAYGROUND", "true");
    expect(
      proxy(
        new NextRequest("https://preview.example.com/labs/intelligent-ui"),
      ).headers.get("x-middleware-next"),
    ).toBe("1");
  });
});
