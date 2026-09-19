import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeSites } from "@/lib/sites/authorizeSites";
import { actionSchema } from "@/lib/sites/schema";
import { selectSite } from "@/lib/supabase/sites/selectSite";
import { updateSite } from "@/lib/supabase/sites/updateSite";
import { selectSignups } from "@/lib/supabase/sites/selectSignups";
import { generateSite } from "@/lib/sites/generateSite";
export const maxDuration = 300;
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
async function load(request: Request, context: Context) {
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success)
    return NextResponse.json({ error: "Invalid site" }, { status: 400 });
  // Authenticate before looking up a site; never return its data before workspace access.
  const caller = await authorizeSites(request);
  if (caller instanceof NextResponse) return caller;
  const site = await selectSite(id);
  if (!site)
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  if (site.owner_id !== caller.accountId) {
    const workspace = await authorizeSites(request, site.owner_id);
    if (workspace instanceof NextResponse) return workspace;
  }
  return site;
}
/** Read a draft and owner-only fan signup data. */
export async function GET(request: Request, context: Context) {
  try {
    const site = await load(request, context);
    if (site instanceof NextResponse) return site;
    return NextResponse.json(
      { site, signups: await selectSignups(site.id) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json({ error: "Could not load site" }, { status: 503 });
  }
}
/** Generate a saved draft or publish/unpublish a snapshot without mutating other versions. */
export async function PATCH(request: Request, context: Context) {
  const body = actionSchema.safeParse(await request.json().catch(() => null));
  if (!body.success)
    return NextResponse.json({ error: "Invalid site action" }, { status: 400 });
  try {
    const site = await load(request, context);
    if (site instanceof NextResponse) return site;
    const input = body.data;
    if (input.revision !== site.revision)
      return NextResponse.json(
        { error: "This site changed in another tab. Reload before editing." },
        { status: 409 },
      );
    if (input.action === "publish" && !site.draft)
      return NextResponse.json(
        { error: "Generate a preview before publishing" },
        { status: 400 },
      );
    const changes =
      input.action === "generate"
        ? { draft: await generateSite(site, input.instruction) }
        : input.action === "publish"
          ? { published: site.draft, published_at: new Date().toISOString() }
          : { published: null, published_at: null };
    const updated = await updateSite(
      site.id,
      site.owner_id,
      site.revision,
      changes,
    );
    if (!updated)
      return NextResponse.json(
        {
          error:
            "This site changed while you were editing. Reload to see the latest version.",
        },
        { status: 409 },
      );
    return NextResponse.json({ site: updated });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not finish this action. Your saved site is unchanged; please try again.",
      },
      { status: 503 },
    );
  }
}
