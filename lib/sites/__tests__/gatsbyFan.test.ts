import { afterEach, beforeEach, expect, it, vi } from "vitest";
const save = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/fans/upsertGatsbySpotifyFan", () => ({
  upsertGatsbySpotifyFan: save,
}));
import { POST } from "@/app/api/sites/spotify/gatsby-fan/route";
import { signGatsbyFlow } from "../gatsby/signGatsbyFlow";
beforeEach(() => {
  vi.stubEnv("SITES_GATSBY_FLOW_SECRET", "test-key");
  vi.stubEnv("SITES_SPOTIFY_CLIENT_ID", "recoup-client");
  vi.stubEnv(
    "SITES_SPOTIFY_REDIRECT_URI",
    "https://app.recoupable.dev/s/spotify/callback",
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});
const request = (flow: string, origin = "https://app.recoupable.dev") =>
  new Request("https://app.recoupable.dev/api/sites/spotify/gatsby-fan", {
    method: "POST",
    headers: { origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "provider-code",
      verifier: "a".repeat(64),
      flow,
    }),
  });
it("captures only the identity from a Recoup client code exchange", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json({ access_token: "verified-token", expires_in: 3600 }),
    )
    .mockResolvedValueOnce(
      Response.json({ id: "fan", email: "verified@example.com" }),
    );
  vi.stubGlobal("fetch", fetch);
  const response = await POST(
    request(
      signGatsbyFlow(
        "https://app.recoupable.dev",
        "https://open.spotify.com/track/4HJjUdcezdSSCBdy5JVHDs",
      ),
    ),
  );
  expect(response.status).toBe(200);
  expect(fetch.mock.calls[0][1].body.get("client_id")).toBe("recoup-client");
  expect(save).toHaveBeenCalledWith({
    id: "fan",
    email: "verified@example.com",
  });
});
it("rejects forged audience context and cross-origin calls before exchanging tokens", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  expect((await POST(request("forged"))).status).toBe(400);
  expect((await POST(request("forged", "https://evil.test"))).status).toBe(403);
  expect(save).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});
