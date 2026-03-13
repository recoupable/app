import createSession from "@/lib/stripe/createSession";
import { NextRequest } from "next/server";

/**
 *
 * @param req
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const accountId = body.accountId;
  const successUrl = body.successUrl;

  try {
    const session = await createSession(accountId, successUrl);
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
