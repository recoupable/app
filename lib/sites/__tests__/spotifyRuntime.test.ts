import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { webcrypto } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
const source = readFileSync("public/sites-runtime.js", "utf8");
function harness(callback: boolean, pending: unknown = null, search = "") {
  const nodes: Record<
    string,
    {
      textContent?: string;
      href?: string;
      disabled?: boolean;
      onclick?: () => Promise<void>;
    }
  > = {};
  const storage = new Map<string, string>();
  if (pending)
    storage.set("recoup-sites-spotify-pending", JSON.stringify(pending));
  const fetch = vi.fn();
  const location = {
    search,
    pathname: "/s/spotify/callback",
    origin: "https://example.test",
    replace: vi.fn(),
    assign: vi.fn(),
  };
  const ctx = {
    document: {
      body: {
        hasAttribute: (a: string) =>
          a === (callback ? "data-spotify-callback" : "data-sites-runtime"),
        dataset: { preview: "false" },
      },
      getElementById: (id: string) => nodes[id] ?? (nodes[id] = {}),
    },
    sessionStorage: {
      getItem: (k: string) => storage.get(k),
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
    },
    history: { replaceState: vi.fn() },
    location,
    fetch,
    URL,
    URLSearchParams,
    crypto: webcrypto,
    TextEncoder,
    Uint8Array,
    btoa: (v: string) => Buffer.from(v, "binary").toString("base64"),
  };
  return {
    ctx,
    nodes,
    fetch,
    storage,
    run: () => runInNewContext(source, ctx),
  };
}
describe("Spotify fan auth", () => {
  it("rejects mismatched OAuth state without exchanging the code", async () => {
    const h = harness(
      true,
      {
        state: "expected",
        created: Date.now(),
        returnPath: "/s/11111111-1111-4111-8111-111111111111",
      },
      "?code=secret&state=wrong",
    );
    await h.run();
    expect(h.fetch).not.toHaveBeenCalled();
    expect(h.nodes["spotify-status"].textContent).toContain("expired");
    expect(h.storage.has("recoup-sites-spotify-pending")).toBe(false);
  });
  it("handles cancelled authorization without pretending to connect", async () => {
    const h = harness(true, null, "?error=access_denied");
    await h.run();
    expect(h.fetch).not.toHaveBeenCalled();
    expect(h.nodes["spotify-status"].textContent).toContain("cancelled");
  });
  it("exchanges valid code with the original verifier and returns only to site path", async () => {
    const h = harness(
      true,
      {
        state: "expected",
        created: Date.now(),
        returnPath: "https://evil.test",
        clientId: "public-id",
        redirectUri: "https://example.test/s/spotify/callback",
        verifier: "verifier",
      },
      "?code=code&state=expected",
    );
    h.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "test-token", expires_in: 3600 }),
    });
    await h.run();
    expect(h.fetch.mock.calls[0][1].body.get("code_verifier")).toBe("verifier");
    expect(h.ctx.location.replace).toHaveBeenCalledWith("/");
  });
  it("shows a truthful unconfigured state", async () => {
    const h = harness(false);
    h.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ configured: false }),
    });
    await h.run();
    expect(h.nodes["spotify-connect"].disabled).toBe(true);
    expect(h.nodes["spotify-status"].textContent).toContain("not configured");
  });
  it("starts PKCE authorization without a client secret or implicit tokens", async () => {
    const h = harness(false);
    h.ctx.location.pathname = "/s/11111111-1111-4111-8111-111111111111";
    h.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        configured: true,
        clientId: "public-id",
        redirectUri: "https://example.test/s/spotify/callback",
      }),
    });
    await h.run();
    await h.nodes["spotify-connect"].onclick!();
    const url = new URL(h.ctx.location.assign.mock.calls[0][0]);
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.has("client_secret")).toBe(false);
  });
});
