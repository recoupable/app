import getAccountById from "@/lib/supabase/accounts/getAccountById";
import { ADMIN_EMAILS } from "@/lib/admin";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 *
 * @param req
 */
export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");

  if (!creatorId) {
    return Response.json({ message: "Missing creatorId" }, { status: 400 });
  }

  try {
    const account = await getAccountById(creatorId);

    if (!account) {
      return Response.json({ message: "Creator not found" }, { status: 404 });
    }

    const info = Array.isArray(account.account_info) ? account.account_info[0] || null : null;
    const email = Array.isArray(account.account_emails)
      ? account.account_emails[0]?.email || null
      : null;
    const isAdmin = !!email && ADMIN_EMAILS.includes(email);

    return Response.json(
      {
        creator: {
          name: account.name || null,
          image: info?.image || null,
          is_admin: isAdmin,
        },
      },
      { status: 200 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
