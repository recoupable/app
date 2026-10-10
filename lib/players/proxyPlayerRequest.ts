import { getSitesApiUrl } from "@/lib/sites/getSitesApiUrl";
/** Same-origin transport only. API owns validation, authorization and fan/event persistence. */
export async function proxyPlayerRequest(
  request: Request,
  path: "events" | "spotify/session",
) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin)
    return Response.json({ error: "Invalid player origin" }, { status: 403 });
  try {
    const response = await fetch(`${getSitesApiUrl()}/api/players/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: await request.text(),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return Response.json(
      { error: "Player service unavailable" },
      { status: 503 },
    );
  }
}
