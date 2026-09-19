import { z } from "zod";

/** Spotify runs here, never in the generated experience's frame. */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const parent = requestUrl.searchParams.get("parent");
  const allowedParents = [
    requestUrl.origin,
    "https://chat.recoupable.dev",
    "https://chat.recoupable.com",
  ];
  if (process.env.NODE_ENV !== "production")
    allowedParents.push("http://localhost:3002", "http://127.0.0.1:3002");
  if (parent && !allowedParents.includes(parent))
    return new Response("Invalid player origin", { status: 400 });
  const audioParam = requestUrl.searchParams.get("audio");
  const audio = audioParam
    ? z
        .string()
        .url()
        .refine((value) => new URL(value).protocol === "https:")
        .safeParse(audioParam)
    : null;
  if (audio && !audio.success)
    return new Response("Invalid audio URL", { status: 400 });
  const audioUrl = audio?.success
    ? audio.data.replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c]!,
      )
    : null;
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
[hidden]{display:none!important}body{font:16px/1.6 system-ui;margin:0;padding:24px;color:#18323a;background:#fff}main{max-width:420px;margin:auto}h1{font-size:28px;font-weight:500;letter-spacing:-1px}button{font:inherit;padding:12px 20px;border:0;border-radius:12px;background:#142d26;color:white;cursor:pointer}button:disabled{opacity:.5}a{color:inherit}#spotify-track{display:block;margin:24px 0}#spotify-track[hidden]{display:none}img{border-radius:8px;vertical-align:middle;margin-right:12px}#spotify-status{color:#536971;font-size:13px}h1{font-size:22px}button{margin:4px 2px}input[type=range]{width:100%;accent-color:#142d26}.transport{display:flex;justify-content:center}#spotify-track img{float:left}#spotify-track-link{font-size:14px;text-decoration:none}label{font-size:12px;color:#536971}body[data-connected] h1,body[data-connected] main>p:first-of-type{display:none}body[data-connected] #spotify-track{margin:12px 0;min-height:64px}body[data-connected] main>p:last-of-type{font-size:12px;margin:8px 0}.transport button{padding:6px 14px}#spotify-disconnect{background:transparent;color:#536971;font-size:12px;padding:4px}
</style></head><body data-sites-runtime data-spotify-player="true" data-player-parent="${parent || ""}" data-release="${value}"><main><h1>Listen with Spotify</h1><p>Connect your account to listen here.</p><button id="spotify-connect">Continue with Spotify</button><button id="spotify-play" hidden disabled>Play music</button><button id="spotify-continue" hidden>Continue to experience</button><button id="spotify-disconnect" hidden>Disconnect</button><p id="spotify-status" role="status">Spotify Premium is required for browser playback.</p><div id="spotify-track" hidden><img id="spotify-cover" width="64" height="64" alt=""><a id="spotify-track-link" target="_blank" rel="noopener noreferrer"></a></div>${audioUrl ? `<section id="audio-fallback" hidden><p>Listen to the artist-provided audio</p><audio controls preload="none" src="${audioUrl}" style="width:100%"></audio></section>` : ""}<section id="spotify-controls" hidden><div class="transport"><button id="spotify-previous" aria-label="Previous track">⏮</button><button id="spotify-next" aria-label="Next track">⏭</button></div><label>Track progress <span id="spotify-time">0:00 / 0:00</span><input id="spotify-seek" type="range" min="0" max="100" value="0" aria-label="Track position"></label><label>Volume<input id="spotify-volume" type="range" min="0" max="100" value="70" aria-label="Volume"></label></section><p><a href="${value}" target="_blank" rel="noopener noreferrer">Open music in Spotify</a></p></main><script src="/sites-runtime.js" defer></script></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": `default-src 'none'; script-src 'self' https://sdk.scdn.co; style-src 'unsafe-inline'; connect-src 'self' https://accounts.spotify.com https://api.spotify.com https://*.spotify.com https://*.scdn.co wss://*.spotify.com; img-src https:; media-src https:; frame-src https://sdk.scdn.co; base-uri 'none'; frame-ancestors ${parent ? allowedParents.join(" ") : "'none'"}`,
      },
    },
  );
}
