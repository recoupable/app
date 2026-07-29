import { NextResponse } from "next/server";
import { z } from "zod";
import { validateEmailReportBody } from "@/lib/catalog/emailReport/validateEmailReportBody";
import { sendCatalogReportEmail } from "@/lib/catalog/emailReport/sendCatalogReportEmail";

const catalogIdSchema = z.string().uuid();

/**
 * POST /api/catalogs/[catalogId]/email-report — "Email me this report"
 * (chat#1902 item C3). Deliberately unauthenticated: the report page is
 * publicly viewable and this is the page's capture, so anonymous viewers must
 * be able to use it. Sends the viewer the report link (plus the headline
 * value they saw) via the chat repo's Resend path. The viewer's email is
 * used for the send only, never logged.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ catalogId: string }> },
): Promise<NextResponse> {
  const { catalogId } = await context.params;
  if (!catalogIdSchema.safeParse(catalogId).success) {
    return NextResponse.json({ error: "Invalid catalog id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validated = validateEmailReportBody(body);
  if (validated.error !== undefined) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const sent = await sendCatalogReportEmail({
    email: validated.data.email,
    catalogId,
    headlineValue: validated.data.headline_value,
  });
  if (!sent) {
    return NextResponse.json(
      { error: "Failed to send the report email" },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";
