import stripeClient from "@/lib/stripe/client";
import { validateHeaders } from "@/lib/chat/validateHeaders";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const querySchema = z.object({
  sessionId: z.string().trim().min(1, "sessionId is required"),
  accountId: z.string().uuid("accountId must be a valid UUID").optional(),
});

export async function GET(req: NextRequest) {
  const auth = await validateHeaders(req);
  if (auth instanceof Response) {
    return auth;
  }

  if (!auth.accountId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rawSessionId = req.nextUrl.searchParams.get("sessionId");
  const rawAccountId = req.nextUrl.searchParams.get("accountId");

  const parsed = querySchema.safeParse({
    sessionId: rawSessionId ?? "",
    accountId:
      rawAccountId === null || rawAccountId === ""
        ? undefined
        : rawAccountId,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.issues[0]?.message ?? "Invalid query parameters",
      },
      { status: 400 },
    );
  }

  const { sessionId, accountId: queryAccountId } = parsed.data;

  if (queryAccountId && queryAccountId !== auth.accountId) {
    return NextResponse.json(
      {
        message: "Forbidden: accountId does not match authenticated account",
      },
      { status: 403 },
    );
  }

  try {
    const session = await stripeClient.checkout.sessions.update(sessionId, {
      metadata: {
        credit_updated: "credit_updated",
        accountId: auth.accountId,
      },
    });

    return NextResponse.json({ data: session }, { status: 200 });
  } catch (error) {
    console.error(error);

    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      if (error.statusCode === 404 || error.code === "resource_missing") {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      const sc = error.statusCode;
      if (typeof sc === "number" && sc >= 400 && sc < 500) {
        return NextResponse.json({ message: error.message }, { status: sc });
      }
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (error instanceof Stripe.errors.StripeError) {
      const statusCode = error.statusCode;
      if (statusCode === 404) {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (
        typeof statusCode === "number" &&
        statusCode >= 400 &&
        statusCode < 500
      ) {
        return NextResponse.json(
          { message: error.message },
          { status: statusCode },
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const message = error instanceof Error ? error.message : "failed";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
