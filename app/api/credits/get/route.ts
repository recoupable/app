import { NextRequest } from "next/server";
import { checkAndResetCredits } from "@/lib/credits/checkAndResetCredits";

/**
 *
 * @param req
 */
export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get("accountId");

  if (!accountId) {
    return Response.json({ message: "accountId is required" }, { status: 400 });
  }

  try {
    const creditsUsage = await checkAndResetCredits(accountId);
    return Response.json({ data: creditsUsage }, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
