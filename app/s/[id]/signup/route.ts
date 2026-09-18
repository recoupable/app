import { z } from "zod";
import { selectSite } from "@/lib/supabase/sites/selectSite";
import { insertSignup } from "@/lib/supabase/sites/insertSignup";
/** Save an explicit fan opt-in; repeat submissions do not disclose membership. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success)
    return new Response("Site not found", { status: 404 });
  try {
    const data = await request.formData();
    const parsed = z
      .object({
        email: z.string().trim().email().max(254),
        consent: z.literal("yes"),
        website: z.literal("").optional(),
      })
      .safeParse(Object.fromEntries(data));
    if (!parsed.success)
      return new Response(
        "Enter a valid email and agree to receive updates. Go back to try again.",
        { status: 400 },
      );
    const site = await selectSite(id);
    if (!site?.published)
      return new Response("Site not found", { status: 404 });
    await insertSignup(
      id,
      parsed.data.email,
      `I agree to receive email updates from ${site.published.name}.`,
    );
    return new Response(
      `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>You’re on the list</title><body style="font:18px system-ui;padding:10vh 8vw;background:#f6f7f6;color:#152c2a"><h1>You’re on the list.</h1><p>Thanks for signing up for email updates.</p><a href="/s/${id}">Back to the site</a></body></html>`,
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'",
        },
      },
    );
  } catch {
    return new Response(
      "Could not save your signup. Please go back and try again.",
      { status: 503 },
    );
  }
}
