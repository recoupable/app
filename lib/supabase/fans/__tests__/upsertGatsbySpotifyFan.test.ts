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
it("uses a stable fan ID and the Gatsby namespace without storing tokens", async () => {
  upsert.mockClear();
  await upsertGatsbySpotifyFan({
    id: "same-fan",
    email: "verified@example.com",
    display_name: "Fan",
  });
  await upsertGatsbySpotifyFan({ id: "same-fan" });
  const first = upsert.mock.calls[0][0];
  expect(first.id).toBe(upsert.mock.calls[1][0].id);
  expect(first.id).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  expect(first.email).toBe("verified@example.com");
  expect(upsert.mock.calls[0][1]).toEqual({ onConflict: "id" });
});
it("reports persistence errors rather than claiming capture succeeded", async () => {
  upsert.mockResolvedValueOnce({ error: { message: "failure" } });
  await expect(upsertGatsbySpotifyFan({ id: "fan" })).rejects.toThrow(
    "Could not save fan",
  );
});
