import { describe, expect, it } from "vitest";
import { isPlaygroundRoute } from "../isPlaygroundRoute";

describe("playground route isolation", () => {
  it("recognizes only the exact fixture page", () => {
    expect(isPlaygroundRoute("/labs/intelligent-ui")).toBe(true);
  });

  it.each([
    null,
    "/",
    "/labs",
    "/labs/other",
    "/labs/intelligent-ui/",
    "/labs/intelligent-ui/private",
    "/labs/intelligent-ui-extra",
    "/api/intelligent-ui/playground",
    "/context",
    "/oauth/authorize",
  ])("does not exempt %s", (pathname) => {
    expect(isPlaygroundRoute(pathname)).toBe(false);
  });
});
