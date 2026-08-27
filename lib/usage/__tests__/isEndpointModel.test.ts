import { describe, expect, it } from "vitest";
import isEndpointModel from "@/lib/usage/isEndpointModel";

describe("isEndpointModel", () => {
  it("recognises an API endpoint stored in model_id", () => {
    expect(isEndpointModel("POST /api/artist/socials/scrape")).toBe(true);
    expect(isEndpointModel("GET /api/research/track/stats")).toBe(true);
  });

  it("does not match a model id or a dash", () => {
    expect(isEndpointModel("minimax/music-3")).toBe(false);
    expect(isEndpointModel("-")).toBe(false);
    expect(isEndpointModel(null)).toBe(false);
  });
});
