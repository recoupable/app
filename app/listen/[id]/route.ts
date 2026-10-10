import { getPlayerConfig } from "@/lib/players/getPlayerConfig";
import { escapePlayerHtml as escape } from "@/lib/players/escapePlayerHtml";
/** Shareable release listening page; opens the same player used by artist-site embeds. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params,
      query = new URL(request.url).searchParams,
      config = await getPlayerConfig(id, new URLSearchParams());
    const campaign = new URLSearchParams();
    for (const key of ["source", "medium", "campaign", "content"]) {
      const value = query.get(key) || query.get(`utm_${key}`);
      if (value) campaign.set(key, value.slice(0, 100));
    }
    const suffix = campaign.size ? `?${escape(campaign.toString())}` : "";
    return new Response(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(config.name)} · Recoup</title><link rel="stylesheet" href="/release-listen.css"></head><body><main>${config.artwork ? `<img src="${escape(config.artwork)}" alt="${escape(config.name)} artwork">` : ""}<h1>${escape(config.name)}</h1><p>Choose where to listen.</p>${config.spotifyUrl ? `<a class="spotify" href="/listen/${id}/spotify${suffix}">Sign in with Spotify</a><a class="fallback" href="${escape(config.spotifyUrl)}" rel="noopener noreferrer">Open Spotify</a>` : ""}${config.appleUrl ? `<a class="apple" href="/listen/${id}/apple_music${suffix}">Sign in with Apple</a><a class="fallback" href="${escape(config.appleUrl)}" rel="noopener noreferrer">Open Apple Music</a>` : ""}</main></body></html>`,
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'self'; img-src https:; base-uri 'none'; frame-ancestors 'none'",
          "Referrer-Policy": "no-referrer",
        },
      },
    );
  } catch {
    return new Response("This listening page is unavailable.", {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
