import { expect, it, vi } from "vitest";
const upsert = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }));
vi.mock("@/lib/supabase/serverClient", () => ({
  default: { from: () => ({ upsert }) },
}));
import { upsertGatsbySpotifyFan } from "../upsertGatsbySpotifyFan";
it("does not erase existing profile fields or marketing consent when Spotify omits them", async () => {
  await upsertGatsbySpotifyFan({ id: "fan", email: null, display_name: null });
  const [row] = upsert.mock.calls[0];
  expect(row).not.toHaveProperty("email");
  expect(row).not.toHaveProperty("display_name");
  expect(row).not.toHaveProperty("consent_given");
  expect(row).not.toHaveProperty("spotify_token");
  expect(row.clientId).toBe("GatsbyWebsite1");
});
