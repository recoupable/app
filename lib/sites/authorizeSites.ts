import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfilePreferenceAccount } from "@/lib/onboarding/server/getProfilePreferenceAccount";
import { NEW_API_BASE_URL } from "@/lib/consts";

/** Resolve workspace ownership from a verified bearer token, never a client account ID. */
export async function authorizeSites(
  request: Request,
  organizationId?: string | null,
) {
  const accountId = await getProfilePreferenceAccount(request);
  if (accountId instanceof NextResponse) return accountId;
  if (organizationId && organizationId !== accountId) {
    const response = await fetch(`${NEW_API_BASE_URL}/api/organizations`, {
      headers: { Authorization: request.headers.get("authorization")! },
      cache: "no-store",
    });
    if (!response.ok)
      return NextResponse.json(
        { error: "Could not verify workspace access" },
        { status: 503 },
      );
    const result = z
      .object({
        organizations: z.array(
          z.object({ organization_id: z.string().uuid() }),
        ),
      })
      .parse(await response.json());
    if (
      !result.organizations.some(
        (org) => org.organization_id === organizationId,
      )
    )
      return NextResponse.json(
        { error: "Workspace not available" },
        { status: 403 },
      );
  }
  return { accountId, ownerId: organizationId || accountId };
}
