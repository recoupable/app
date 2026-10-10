import { z } from "zod";
import { getPlayerConfig } from "@/lib/players/getPlayerConfig";
import { renderApplePlayer } from "@/lib/players/renderApplePlayer";
import { renderSpotifyPlayer } from "@/lib/sites/renderSpotifyPlayer";
import { escapePlayerHtml } from "@/lib/players/escapePlayerHtml";
/** Single trusted browser player for every registered release and external embed. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; provider: string }> },
) {
  const { id, provider } = await params;
  if (
    !z.string().uuid().safeParse(id).success ||
    !["spotify", "apple_music"].includes(provider)
  )
    return new Response("Invalid player", { status: 400 });
  try {
    const url = new URL(request.url),
      query = url.searchParams;
    query.set("provider", provider);
    const config = await getPlayerConfig(id, query),
      parent = query.get("parent") || "";
    if (config.provider !== provider || !config.flow || !config.sessionId)
      throw new Error("Invalid player configuration");
    const html =
      provider === "spotify"
        ? renderSpotifyPlayer(
            escapePlayerHtml(config.spotifyUrl!),
            escapePlayerHtml(parent),
            null,
            {
              background: "#121212",
              foreground: "#ffffff",
              accent: "#1DB954",
              font: "sans",
              title: config.name,
              artwork: config.artwork || "",
            },
            undefined,
            true,
            config,
          )
        : renderApplePlayer(config, parent);
    const scripts =
      provider === "spotify"
        ? "https://sdk.scdn.co"
        : "https://js-cdn.music.apple.com";
    const connects =
      provider === "spotify"
        ? "https://accounts.spotify.com https://api.spotify.com https://*.spotify.com https://*.scdn.co wss://*.spotify.com"
        : "https://*.apple.com https://*.mzstatic.com";
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": `default-src 'none'; script-src 'self' ${scripts}; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' ${connects}; img-src https:; media-src https: blob:; frame-src ${provider === "spotify" ? "https://sdk.scdn.co" : "https://*.apple.com"}; base-uri 'none'; frame-ancestors ${parent || "'none'"}`,
      },
    });
  } catch {
    return new Response(
      "This player is unavailable. Return to the artist's listening page.",
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
