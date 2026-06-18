import { describe, it, expect } from "vitest";
import { ALLOWED_ARTIST_CONNECTORS } from "../allowedArtistConnectors";

describe("ALLOWED_ARTIST_CONNECTORS", () => {
  it("includes tiktok, instagram, youtube, and twitter", () => {
    expect(ALLOWED_ARTIST_CONNECTORS).toContain("tiktok");
    expect(ALLOWED_ARTIST_CONNECTORS).toContain("instagram");
    expect(ALLOWED_ARTIST_CONNECTORS).toContain("youtube");
    expect(ALLOWED_ARTIST_CONNECTORS).toContain("twitter");
  });

  it("does not include linkedin (label/owner-only)", () => {
    expect(ALLOWED_ARTIST_CONNECTORS).not.toContain("linkedin");
  });
});
