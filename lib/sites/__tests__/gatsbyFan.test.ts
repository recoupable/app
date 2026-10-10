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
it("rejects a correctly signed non-Gatsby audience before contacting Spotify", async () => {
  const { createHmac } = await import("node:crypto");
  const payload = Buffer.from(
    JSON.stringify({
      audience: "other-label",
      origin: "https://app.recoupable.dev",
      release: "https://open.spotify.com/track/4HJjUdcezdSSCBdy5JVHDs",
      expires: Date.now() + 600000,
    }),
  ).toString("base64url");
  const flow = `${payload}.${createHmac("sha256", "test-key").update(`gatsby-flow:v1:${payload}`).digest("base64url")}`;
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  expect((await POST(request(flow))).status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
});
it("never accepts an email injected into the authorization request", async () => {
  const valid = request(
    signGatsbyFlow(
      "https://app.recoupable.dev",
      "https://open.spotify.com/track/4HJjUdcezdSSCBdy5JVHDs",
    ),
  );
  const body = await valid.json();
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const forged = new Request(valid.url, {
    method: "POST",
    headers: valid.headers,
    body: JSON.stringify({ ...body, email: "forged@example.com" }),
  });
  expect((await POST(forged)).status).toBe(400);
  expect(fetch).not.toHaveBeenCalled();
  expect(save).not.toHaveBeenCalled();
});
it("rejects provider authorization failures without capturing a fan", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("", { status: 401 })),
  );
  expect(
    (
      await POST(
        request(
          signGatsbyFlow(
            "https://app.recoupable.dev",
            "https://open.spotify.com/track/4HJjUdcezdSSCBdy5JVHDs",
          ),
        ),
      )
    ).status,
  ).toBe(401);
  expect(save).not.toHaveBeenCalled();
});
