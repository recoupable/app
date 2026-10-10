import { afterEach, expect, it, vi } from "vitest";
const save = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/fans/upsertGatsbySpotifyFan", () => ({
  upsertGatsbySpotifyFan: save,
}));
import { POST } from "@/app/api/sites/spotify/gatsby-fan/route";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});
const request = (origin = "https://app.recoupable.dev") =>
  new Request("https://app.recoupable.dev/api/sites/spotify/gatsby-fan", {
    method: "POST",
    headers: { origin, authorization: "Bearer a+b/c==" },
    body: JSON.stringify({ email: "forged@example.com" }),
  });
it("never trusts the submitted email", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json({ id: "fan", email: "verified@example.com" }),
      ),
  );
  expect((await POST(request())).status).toBe(200);
  expect(save).toHaveBeenCalledWith({
    id: "fan",
    email: "verified@example.com",
  });
});
it("rejects cross-origin capture and invalid provider authorization", async () => {
  expect((await POST(request("https://evil.test"))).status).toBe(403);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("", { status: 401 })),
  );
  expect((await POST(request())).status).toBe(401);
  expect(save).not.toHaveBeenCalled();
});
