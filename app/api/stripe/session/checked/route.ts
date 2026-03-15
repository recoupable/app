import stripeClient from "@/lib/stripe/client";
import { NextRequest } from "next/server";

/**
 *
 * @param req
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const accountId = req.nextUrl.searchParams.get("accountId");

  if (!sessionId) {
    return Response.json({ message: "sessionId is required" }, { status: 400 });
  }

  try {
    const session = await stripeClient.checkout.sessions.update(sessionId, {
      metadata: {
        credit_updated: "credit_updated",
        accountId,
      },
    });

    return Response.json({ data: session }, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
