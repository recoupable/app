import { describe, it, expect } from "vitest";
import { ALLOWED_ARTIST_CONNECTORS } from "../allowedArtistConnectors";

describe("ALLOWED_ARTIST_CONNECTORS", () => {
  it("includes tiktok, instagram, youtube, twitter, and linkedin", () => {
    expect(ALLOWED_ARTIST_CONNECTORS).toContain("tiktok");
    expect(ALLOWED_ARTIST_CONNECTORS).toContain("instagram");
    expect(ALLOWED_ARTIST_CONNECTORS).toContain("youtube");
    expect(ALLOWED_ARTIST_CONNECTORS).toContain("twitter");
    expect(ALLOWED_ARTIST_CONNECTORS).toContain("linkedin");
  });
});
