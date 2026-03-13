import { NextRequest } from "next/server";
import { getActiveSubscriptionDetails } from "@/lib/stripe/getActiveSubscriptionDetails";
import { getOrgSubscription } from "@/lib/stripe/getOrgSubscription";
import isActiveSubscription from "@/lib/stripe/isActiveSubscription";

export interface ProStatusResponse {
  isPro: boolean;
}

/**
 * GET /api/subscription/status?accountId=xxx
 * Returns whether the account has pro status (via account or org subscription)
 *
 * @param req
 */
export async function GET(req: NextRequest): Promise<Response> {
  const accountId = req.nextUrl.searchParams.get("accountId");

  if (!accountId) {
    return Response.json({ message: "accountId is required" }, { status: 400 });
  }

  try {
    // Check all pro sources in parallel (account subscription or org subscription)
    const [accountSubscription, orgSubscription] = await Promise.all([
      getActiveSubscriptionDetails(accountId),
      getOrgSubscription(accountId),
    ]);

    const isPro =
      isActiveSubscription(accountSubscription) || isActiveSubscription(orgSubscription);

    return Response.json({ isPro }, { status: 200 });
  } catch (error) {
    console.error("[Pro Status] Error:", error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
