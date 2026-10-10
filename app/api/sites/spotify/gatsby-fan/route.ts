import { z } from "zod";
import { upsertGatsbySpotifyFan } from "@/lib/supabase/fans/upsertGatsbySpotifyFan";
/** Capture only a Spotify-confirmed identity, never a client-supplied email. */
export async function POST(request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ saved: false }, { status: 403, headers });
  const authorization = request.headers.get("authorization") || "";
  if (!/^Bearer [A-Za-z0-9._~-]{1,4096}$/.test(authorization))
    return Response.json({ saved: false }, { status: 401, headers });
  try {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: authorization },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      return Response.json({ saved: false }, { status: 401, headers });
    const profile = z
      .object({
        id: z.string().min(1).max(255),
        email: z.string().email().max(254).nullish(),
        display_name: z.string().max(255).nullish(),
      })
      .parse(await response.json());
    await upsertGatsbySpotifyFan(profile);
    return Response.json(
      { saved: true, emailAvailable: !!profile.email },
      { headers },
    );
  } catch {
    return Response.json({ saved: false }, { status: 503, headers });
  }
}
