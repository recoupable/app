/** A trusted callback surface, separate from generated experiences. */
export async function GET() {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connecting Spotify</title></head><body data-spotify-callback><main><h1>Connecting Spotify</h1><p id="spotify-status" role="status">Finishing your connection…</p><a id="return-link" href="/">Back to Recoup</a></main><script src="/sites-runtime.js" defer></script></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy":
          "default-src 'none'; script-src 'self'; connect-src 'self' https://accounts.spotify.com; base-uri 'none'; frame-ancestors 'none'",
      },
    },
  );
}
