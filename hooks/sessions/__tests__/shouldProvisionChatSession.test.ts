import { describe, expect, it } from "vitest";
import {
  provisionInputsMatch,
  shouldProvisionChatSession,
} from "../shouldProvisionChatSession";

describe("shouldProvisionChatSession", () => {
  const base = {
    enabled: true,
    artistId: "artist-a",
    orgId: undefined as string | undefined,
    lastVariables: undefined,
    isPending: false,
    isSuccess: false,
  };

  it("returns false when disabled", () => {
    expect(
      shouldProvisionChatSession({
        ...base,
        enabled: false,
      }),
    ).toBe(false);
  });

  it("returns false when the same inputs are already pending", () => {
    expect(
      shouldProvisionChatSession({
        ...base,
        lastVariables: { artistId: "artist-a", orgId: undefined },
        isPending: true,
      }),
    ).toBe(false);
  });

  it("returns false when the same inputs already succeeded", () => {
    expect(
      shouldProvisionChatSession({
        ...base,
        lastVariables: { artistId: "artist-a", orgId: undefined },
        isSuccess: true,
      }),
    ).toBe(false);
  });

  it("returns false while a mismatched request is still pending", () => {
    expect(
      shouldProvisionChatSession({
        ...base,
        artistId: "artist-b",
        lastVariables: { artistId: "artist-a", orgId: undefined },
        isPending: true,
      }),
    ).toBe(false);
  });

  it("returns true for a new input pair when idle", () => {
    expect(shouldProvisionChatSession(base)).toBe(true);
  });

  it("returns true after a mismatched pending request settles", () => {
    expect(
      shouldProvisionChatSession({
        ...base,
        artistId: "artist-b",
        lastVariables: { artistId: "artist-a", orgId: undefined },
        isPending: false,
        isSuccess: true,
      }),
    ).toBe(true);
  });
});

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
