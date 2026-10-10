import { z } from "zod";
import { upsertGatsbySpotifyFan } from "@/lib/supabase/fans/upsertGatsbySpotifyFan";
import { verifyGatsbyFlow } from "@/lib/sites/gatsby/verifyGatsbyFlow";
/** Exchange a Recoup-issued Gatsby PKCE flow and capture Spotify-confirmed identity. */
export async function POST(request: Request) {
  const headers = {
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
  };
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin)
    return Response.json({ saved: false }, { status: 403, headers });
  try {
    const { code, verifier, flow } = z
      .object({
        code: z.string().min(1).max(2048),
        verifier: z.string().regex(/^[A-Za-z0-9._~-]{43,128}$/),
        flow: z.string().min(1).max(2048),
      })
      .strict()
      .parse(await request.json());
    verifyGatsbyFlow(flow, origin);
    const clientId = process.env.SITES_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.SITES_SPOTIFY_REDIRECT_URI;
    if (!clientId || !redirectUri || new URL(redirectUri).origin !== origin)
      throw new Error("Unavailable");
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
        code_verifier: verifier,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      return Response.json({ saved: false }, { status: 401, headers });
    const token = z
      .object({
        access_token: z.string().min(1),
        refresh_token: z.string().optional(),
        expires_in: z.number().positive(),
        token_type: z.string().optional(),
        scope: z.string().optional(),
      })
      .parse(await response.json());
    let saved = false;
    try {
      const profileResponse = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token.access_token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!profileResponse.ok) throw new Error("Profile unavailable");
      const profile = z
        .object({
          id: z.string().min(1).max(255),
          email: z.string().email().max(254).nullish(),
          display_name: z.string().max(255).nullish(),
        })
        .parse(await profileResponse.json());
      await upsertGatsbySpotifyFan(profile);
      saved = true;
    } catch {
      console.error("[sites:gatsby-fan] Verified profile capture unavailable");
    }
    return Response.json(
      { ...token, gatsby_flow_completed: true, fanCapture: saved },
      { headers },
    );
  } catch {
    return Response.json({ saved: false }, { status: 400, headers });
  }
}
