/** Public OAuth identifiers only. No client secret is sent to a browser. */
export async function GET() {
  const clientId = process.env.SITES_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SITES_SPOTIFY_REDIRECT_URI;
  return Response.json(
    {
      configured: !!clientId && !!redirectUri,
      clientId: clientId || null,
      redirectUri: redirectUri || null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
