import { describe, expect, it } from "vitest";
import { provisionInputsMatch } from "../provisionInputsMatch";

describe("provisionInputsMatch", () => {
  it("matches when artistId and orgId equal lastVariables", () => {
    expect(
      provisionInputsMatch(
        { artistId: "artist-a", orgId: "org-1" },
        "artist-a",
        "org-1",
      ),
    ).toBe(true);
  });

  it("does not match when artistId differs", () => {
    expect(
      provisionInputsMatch(
        { artistId: "artist-a", orgId: undefined },
        "artist-b",
        undefined,
      ),
    ).toBe(false);
  });
});
