import createBillingPortalSession from "@/lib/stripe/createBillingPortalSession";
import { NextRequest } from "next/server";

/**
 *
 * @param req
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const accountId = body.accountId;
  const returnUrl = body.returnUrl;

  try {
    const portalSession = await createBillingPortalSession(accountId, returnUrl);
    return Response.json({ data: portalSession }, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
