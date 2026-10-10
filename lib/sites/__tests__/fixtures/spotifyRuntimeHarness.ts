import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { webcrypto } from "node:crypto";
import { vi } from "vitest";
const source = readFileSync("public/sites-runtime.js", "utf8");
export function spotifyRuntimeHarness(
  callback: boolean,
  pending: unknown = null,
  search = "",
) {
  const nodes: Record<
    string,
    {
      appendChild?: ReturnType<typeof vi.fn>;
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
    href: "https://example.test/s/spotify/connect?parent=https://example.test",
    reload: vi.fn(),
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
        dataset: {
          preview: "false",
          spotifyPlayer: "true",
          connectUrl: "",
          release: "",
          playerParent: "",
        },
      },
      getElementById: (id: string) =>
        nodes[id] ?? (nodes[id] = { appendChild: vi.fn() }),
      createElement: () => ({}),
    },
    sessionStorage: {
      getItem: (k: string) => storage.get(k),
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
    },
    window: {
      open: vi.fn(),
      addEventListener: vi.fn(),
      opener: null as null | { postMessage: ReturnType<typeof vi.fn> },
      close: vi.fn(),
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
