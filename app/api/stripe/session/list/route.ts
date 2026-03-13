import stripeClient from "@/lib/stripe/client";
import { NextRequest } from "next/server";

/**
 *
 * @param req
 */
export async function GET(req: NextRequest) {
  const referenceId = req.nextUrl.searchParams.get("referenceId");

  try {
    const sessions = await stripeClient.checkout.sessions.list({
      limit: 100,
    });

    const session = sessions.data.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => item.client_reference_id === referenceId,
    );

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
