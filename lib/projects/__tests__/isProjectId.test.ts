import { describe, it, expect } from "vitest";
import { isProjectId } from "@/lib/projects/isProjectId";

describe("isProjectId", () => {
  it("accepts a UUID in either case", () => {
    expect(isProjectId("5e9eca42-b5af-47ef-83c9-3e498506a3d6")).toBe(true);
    expect(isProjectId("5E9ECA42-B5AF-47EF-83C9-3E498506A3D6")).toBe(true);
  });

  it("rejects anything that is not a bare UUID", () => {
    expect(isProjectId("not-a-uuid")).toBe(false);
    expect(isProjectId("5e9eca42-b5af-47ef-83c9-3e498506a3d6/tasks")).toBe(false);
    expect(isProjectId("")).toBe(false);
  });
});
