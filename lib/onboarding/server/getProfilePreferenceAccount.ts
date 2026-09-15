import { NextResponse } from "next/server";
import { z } from "zod";
import { NEW_API_BASE_URL } from "@/lib/consts";

/** Reuse Recoup API authentication; never accept account identity from the client. */
export async function getProfilePreferenceAccount(
  request: Request,
): Promise<string | NextResponse> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.match(/^Bearer \S+$/i))
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const response = await fetch(`${NEW_API_BASE_URL}/api/accounts/id`, {
    headers: { Authorization: authorization },
    cache: "no-store",
  });
  if (!response.ok)
    return NextResponse.json(
      { error: "Could not verify your account" },
      {
        status: response.status === 401 || response.status === 403 ? 401 : 503,
      },
    );
  const parsed = z
    .object({ accountId: z.string().uuid() })
    .safeParse(await response.json());
  if (!parsed.success) throw new Error("Invalid account response");
  return parsed.data.accountId;
}
