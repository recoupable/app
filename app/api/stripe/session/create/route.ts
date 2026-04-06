import createSession from "@/lib/stripe/createSession";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateHeaders } from "@/lib/chat/validateHeaders";

const createStripeSessionBodySchema = z.object({
  successUrl: z.string().url("successUrl must be a valid URL"),
  accountId: z.string().uuid("accountId must be a valid UUID").optional(),
});

export async function POST(req: NextRequest) {
  const auth = await validateHeaders(req);
  if (auth instanceof Response) {
    return auth;
  }

  if (!auth.accountId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsedBody = createStripeSessionBodySchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({ message: parsedBody.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { accountId, successUrl } = parsedBody.data;

  if (accountId && accountId !== auth.accountId) {
    return NextResponse.json(
      { message: "Forbidden: accountId override is not allowed" },
      { status: 403 },
    );
  }

  try {
    const session = await createSession(auth.accountId, successUrl);
    return Response.json({ data: session }, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
