// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { renderSpotifyPlayer } from "../renderSpotifyPlayer";

const stylesheet = readFileSync("public/sites-player.css", "utf8");
const runtime = readFileSync("public/sites-runtime.js", "utf8");

afterEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
  document.body.innerHTML = "";
});

it.each(["expired", "rejected"])(
  "renders a reachable Disconnect for a %s session without exposing playback",
  async (state) => {
    document.open();
    document.write(
      renderSpotifyPlayer("", "https://artist.example", null)
        .replace(
          '<link rel="stylesheet" href="/sites-player.css">',
          `<style>${stylesheet}</style>`,
        )
        .replace(/<script[^>]*>[\s\S]*?<\/script>/g, ""),
    );
    document.close();
    sessionStorage.setItem(
      "recoup-sites-spotify",
      JSON.stringify({
        access_token: "synthetic-token",
        expiresAt: state === "expired" ? 0 : Date.now() + 3600000,
      }),
    );
    const fetch = vi.fn(async (url: string) => {
      if (url === "/api/sites/spotify/config")
        return { ok: true, json: async () => ({ configured: true }) };
      return { ok: false, status: 401 };
    });
    vi.stubGlobal("fetch", fetch);
    await window.eval(runtime);
    const disconnect = document.querySelector<HTMLButtonElement>(
      "#spotify-disconnect",
    )!;
    expect(disconnect.hidden).toBe(false);
    expect(getComputedStyle(disconnect).display).not.toBe("none");
    expect(getComputedStyle(disconnect).visibility).toBe("visible");
    expect(disconnect.disabled).toBe(false);
    expect(disconnect.textContent).toBe("Disconnect");
    expect(document.body.dataset.connected).toBeUndefined();
    expect(document.body.dataset.playerVisible).toBeUndefined();
    expect(
      document.querySelector<HTMLButtonElement>("#spotify-play")!.hidden,
    ).toBe(true);
    expect(
      document.querySelector<HTMLButtonElement>("#spotify-skip")!.hidden,
    ).toBe(false);
    expect(
      getComputedStyle(document.querySelector("a.player-link")!).display,
    ).toBe("none");
    expect(document.querySelector("#spotify-status")!.textContent).toMatch(
      /reconnect/i,
    );
  },
);
