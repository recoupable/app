import { NextResponse } from "next/server";
import { z } from "zod";
import { NEW_API_BASE_URL } from "@/lib/consts";
import { getProfilePreferenceAccount } from "@/lib/onboarding/server/getProfilePreferenceAccount";
import { selectWorkspaceSessionIds } from "@/lib/supabase/sessions/selectWorkspaceSessionIds";

/** Resolve workspace membership server-side, then list only the caller's sessions. */
export async function getChatScope(request: Request) {
  const query = z
    .object({ organizationId: z.string().uuid().optional() })
    .strict()
    .safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!query.success)
    return NextResponse.json({ error: "Invalid workspace" }, { status: 400 });
  try {
    const accountId = await getProfilePreferenceAccount(request);
    if (accountId instanceof NextResponse) return accountId;
    const organizationId = query.data.organizationId;
    if (organizationId) {
      const response = await fetch(`${NEW_API_BASE_URL}/api/organizations`, {
        headers: { Authorization: request.headers.get("authorization")! },
        cache: "no-store",
      });
      if (!response.ok)
        return NextResponse.json(
          { error: "Could not verify workspace" },
          { status: 503 },
        );
      const { organizations } = z
        .object({
          organizations: z.array(
            z.object({ organization_id: z.string().uuid() }),
          ),
        })
        .parse(await response.json());
      if (!organizations.some((org) => org.organization_id === organizationId))
        return NextResponse.json(
          { error: "Workspace not available" },
          { status: 403 },
        );
    }
    const sessionIds = await selectWorkspaceSessionIds(
      accountId,
      organizationId ?? accountId,
    );
    return NextResponse.json(
      { sessionIds },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load workspace conversations" },
      { status: 503 },
    );
  }
}
