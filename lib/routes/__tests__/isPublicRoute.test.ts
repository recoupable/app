import { describe, it, expect } from "vitest";
import { isPublicRoute } from "@/lib/routes/isPublicRoute";

describe("isPublicRoute", () => {
  it("matches the public artist profile path", () => {
    expect(isPublicRoute("/artists/5e9eca42-b5af-47ef-83c9-3e498506a3d6")).toBe(true);
    expect(isPublicRoute("/artists/5E9ECA42-B5AF-47EF-83C9-3E498506A3D6")).toBe(true);
  });

  it("does not match the authed roster or non-uuid paths", () => {
    expect(isPublicRoute("/artists")).toBe(false);
    expect(isPublicRoute("/artists/")).toBe(false);
    expect(isPublicRoute("/artists/not-a-uuid")).toBe(false);
    expect(isPublicRoute("/artists/5e9eca42-b5af-47ef-83c9-3e498506a3d6/edit")).toBe(false);
    expect(isPublicRoute("/")).toBe(false);
    expect(isPublicRoute(null)).toBe(false);
  });
});
