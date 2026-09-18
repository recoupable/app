import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeSites } from "@/lib/sites/authorizeSites";
import { siteInputSchema } from "@/lib/sites/schema";
import { selectSites } from "@/lib/supabase/sites/selectSites";
import { insertSite } from "@/lib/supabase/sites/insertSite";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { validateSiteAssets } from "@/lib/sites/validateSiteAssets";
export const dynamic = "force-dynamic";
/** List sites in the authenticated workspace and optional artist scope. */
export async function GET(request: Request) {
  const query = z
    .object({
      organizationId: z.string().uuid().optional(),
      artistId: z.string().uuid().optional(),
    })
    .strict()
    .safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success)
    return NextResponse.json({ error: "Invalid workspace" }, { status: 400 });
  try {
    const auth = await authorizeSites(request, query.data.organizationId);
    if (auth instanceof NextResponse) return auth;
    return NextResponse.json(
      { sites: await selectSites(auth.ownerId, query.data.artistId) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load sites. Please try again." },
      { status: 503 },
    );
  }
}
/** Create a durable draft before generation, so failed generation can be retried. */
export async function POST(request: Request) {
  const parsed = siteInputSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  try {
    const input = parsed.data;
    const auth = await authorizeSites(request, input.organizationId);
    if (auth instanceof NextResponse) return auth;
    if (!validateSiteAssets(input.assets, auth.ownerId))
      return NextResponse.json(
        { error: "Upload assets to this workspace first" },
        { status: 400 },
      );
    if (input.artistId) {
      const response = await fetch(
        `${NEW_API_BASE_URL}/api/artists/${input.artistId}/socials?limit=1`,
        {
          headers: { Authorization: request.headers.get("authorization")! },
          cache: "no-store",
        },
      );
      if (!response.ok)
        return NextResponse.json(
          { error: "Artist not available" },
          { status: 403 },
        );
    }
    const site = await insertSite({
      owner_id: auth.ownerId,
      created_by: auth.accountId,
      artist_id: input.artistId,
      name: input.name,
      brief: input.brief,
      release_url: input.releaseUrl,
      assets: input.assets,
    });
    return NextResponse.json({ site }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not save your site. Please try again." },
      { status: 503 },
    );
  }
}
