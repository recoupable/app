import { NextRequest, NextResponse } from "next/server";
import supabase from "@/lib/supabase/serverClient";
import { z } from "zod";
import { validateHeaders } from "@/lib/chat/validateHeaders";
import { checkAccountArtistAccess } from "@/lib/supabase/account_artist_ids/checkAccountArtistAccess";

const deleteScheduledActionBodySchema = z.object({
  id: z.string().uuid("id must be a valid UUID"),
});

export async function DELETE(req: NextRequest) {
  const auth = await validateHeaders(req);
  if (auth instanceof Response) {
    return auth;
  }

  const accountId = auth.accountId;
  if (!accountId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = deleteScheduledActionBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid id" }, { status: 400 });
  }

  try {
    const { id } = parsed.data;

    const { data: scheduledAction, error: selectError } = await supabase
      .from("scheduled_actions")
      .select("id, account_id, artist_account_id")
      .eq("id", id)
      .maybeSingle();

    if (selectError) {
      throw new Error(`Failed to load task: ${selectError.message}`);
    }

    if (!scheduledAction) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const canDeleteAsOwner = scheduledAction.account_id === accountId;
    const canDeleteAsArtistAccess = canDeleteAsOwner
      ? true
      : await checkAccountArtistAccess(accountId, scheduledAction.artist_account_id);

    if (!canDeleteAsOwner && !canDeleteAsArtistAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("scheduled_actions")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task from database" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

