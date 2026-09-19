import { z } from "zod";

/** Spotify runs here, never in the generated experience's frame. */
export async function GET(request: Request) {
  const release = z
    .string()
    .regex(
      /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?(?:track|album|playlist)\/[A-Za-z0-9]+\/?(?:\?[^<>"']*)?$/,
    )
    .safeParse(new URL(request.url).searchParams.get("release"));
  if (!release.success)
    return new Response(
      "A Spotify track, album, or playlist link is required.",
      { status: 400 },
    );
  const value = release.data.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Spotify · Recoup</title><style>
body{font:16px/1.6 system-ui;margin:0;padding:32px;color:#18323a;background:#fff}main{max-width:420px;margin:auto}h1{font-size:28px;font-weight:500;letter-spacing:-1px}button{font:inherit;padding:12px 20px;border:0;border-radius:12px;background:#142d26;color:white;cursor:pointer}button:disabled{opacity:.5}a{color:inherit}#spotify-track{display:block;margin:24px 0}#spotify-track[hidden]{display:none}img{border-radius:8px;vertical-align:middle;margin-right:12px}#spotify-status{color:#536971}
</style></head><body data-sites-runtime data-spotify-player="true" data-release="${value}"><main><h1>Your music on Spotify</h1><p>Connect with SyncStream. Keep this window open while you return to your site.</p><button id="spotify-connect">Continue with Spotify</button><button id="spotify-play" hidden disabled>Play music</button><button id="spotify-disconnect" hidden>Disconnect</button><p id="spotify-status" role="status">Spotify Premium is required for browser playback.</p><div id="spotify-track" hidden><img id="spotify-cover" width="64" height="64" alt=""><a id="spotify-track-link" target="_blank" rel="noopener noreferrer"></a></div><p><a href="${value}" target="_blank" rel="noopener noreferrer">Open music in Spotify</a></p></main><script src="/sites-runtime.js" defer></script></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy":
          "default-src 'none'; script-src 'self' https://sdk.scdn.co; style-src 'unsafe-inline'; connect-src 'self' https://accounts.spotify.com https://api.spotify.com https://*.spotify.com https://*.scdn.co wss://*.spotify.com; img-src https:; media-src https:; frame-src https://sdk.scdn.co; base-uri 'none'; frame-ancestors 'none'",
      },
    },
  );
}
