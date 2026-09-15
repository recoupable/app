import supabase from "@/lib/supabase/serverClient";

/** Scope owned sessions by the canonical repo returned by API's ensurePersonalRepo. */
export async function selectWorkspaceSessionIds(
  accountId: string,
  workspaceId: string,
) {
  const cloneUrl = `https://github.com/recoupable/${workspaceId}`;
  const ids: string[] = [];
  // Supabase caps each response; do not silently lose older workspace chats.
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase
      .from("sessions")
      .select("id")
      .eq("account_id", accountId)
      .in("clone_url", [cloneUrl, `${cloneUrl}.git`])
      .neq("status", "archived")
      .order("id")
      .range(offset, offset + 999);
    if (error) throw error;
    ids.push(...(data ?? []).map((session) => session.id));
    if (!data || data.length < 1000) return ids;
  }
}
