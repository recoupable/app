/** Proxy only the public, origin-bound MusicKit token, never Apple signing keys. */
export async function GET() {
  try {
    const response = await fetch(
      "https://api.recoupable.dev/api/sites/apple/config",
      { cache: "no-store", signal: AbortSignal.timeout(10000) },
    );
    if (!response.ok) throw new Error("Unavailable");
    const config = await response.json();
    return Response.json(
      config.configured && typeof config.developerToken === "string"
        ? { configured: true, developerToken: config.developerToken }
        : { configured: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { configured: false },
      { headers: { "Cache-Control": "no-store" }, status: 503 },
    );
  }
}
