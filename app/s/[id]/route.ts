import { z } from "zod";
import { selectSite } from "@/lib/supabase/sites/selectSite";
import { renderSite } from "@/lib/sites/renderSite";
export const dynamic = "force-dynamic";
/** Public HTML is rendered from a published snapshot only, without the app shell. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success)
    return new Response("Site not found", { status: 404 });
  try {
    const site = await selectSite(id);
    if (!site?.published)
      return new Response("This site is not published.", { status: 404 });
    return new Response(renderSite(site.published, `/s/${id}/signup`), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Security-Policy":
          "default-src 'none'; script-src 'self' 'unsafe-inline' https://sdk.scdn.co; connect-src 'self' https://api.spotify.com https://accounts.spotify.com https://*.spotify.com https://*.scdn.co wss://*.spotify.com; frame-src 'self' https://sdk.scdn.co; style-src 'unsafe-inline'; img-src https:; media-src https:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return new Response("Site temporarily unavailable", { status: 503 });
  }
}
