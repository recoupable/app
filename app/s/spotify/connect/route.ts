import { z } from "zod";
import { renderSpotifyPlayer } from "@/lib/sites/renderSpotifyPlayer";

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
  return new Response(renderSpotifyPlayer(value, parent || "", audioUrl), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": `default-src 'none'; script-src 'self' https://sdk.scdn.co; style-src 'self'; font-src 'self'; connect-src 'self' https://accounts.spotify.com https://api.spotify.com https://*.spotify.com https://*.scdn.co wss://*.spotify.com; img-src 'self' https:; media-src https:; frame-src https://sdk.scdn.co; base-uri 'none'; frame-ancestors ${parent ? allowedParents.join(" ") : "'none'"}`,
    },
  });
}
