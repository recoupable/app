/** MusicKit authorization and playback stay on Recoup's trusted origin. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const release = url.searchParams.get("release") || "";
  const match =
    /^https:\/\/music\.apple\.com\/([a-z]{2})\/(album|song)\/[^/?]+\/(\d+)(?:\?i=(\d+))?$/.exec(
      release,
    );
  const parent = url.searchParams.get("parent") || "";
  const origins = ["https://gatsby.wtf", "https://www.gatsby.wtf"];
  if (process.env.NODE_ENV !== "production")
    origins.push(
      "http://localhost:3002",
      "http://127.0.0.1:3002",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3006",
    );
  if (!match || (parent && !origins.includes(parent)))
    return new Response("Invalid player destination", { status: 400 });
  const kind = match[4] ? "song" : match[2];
  const id = match[4] || match[3];
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Apple · Recoup</title><link rel="stylesheet" href="/sites-player.css"></head><body data-apple-player data-player-parent="${parent}" data-release-kind="${kind}" data-release-id="${id}"><main id="syncstream-player"><header class="sign-header"><span>Apple Music</span></header><section class="sign-body"><h1>Listen to Gatsby</h1><p class="sign-description">Sign in to listen here with your Apple Music subscription.</p><button id="apple-connect" class="sign-button" disabled>Sign in with Apple</button><div id="apple-controls" hidden><button id="apple-previous" class="player-link">Previous</button><button id="apple-play" class="sign-button">Play</button><button id="apple-next" class="player-link">Next</button><p id="apple-track"></p><button id="apple-disconnect" class="player-link">Disconnect</button></div><p id="apple-status" role="status">Preparing Apple Music…</p></section><footer><a class="player-link" href="${release}" target="_blank" rel="noopener noreferrer">Open in Apple Music</a></footer></main><script src="/sites-apple-runtime.js" defer></script></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": `default-src 'none'; script-src 'self' https://js-cdn.music.apple.com; style-src 'self'; font-src 'self'; connect-src 'self' https://*.apple.com https://*.mzstatic.com; media-src https: blob:; img-src https:; frame-src https://*.apple.com; base-uri 'none'; frame-ancestors ${parent || "'none'"}`,
      },
    },
  );
}
