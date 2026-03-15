import supabase from "@/lib/supabase/serverClient";
import type { Tables } from "@/types/database.types";

export type AccountWorkspaceRow = Tables<"account_workspace_ids">;

/**
 * Select account_workspace_ids row by workspace_id
 *
 * @param workspaceId
 */
export async function selectAccountWorkspaceIds(
  workspaceId: string,
): Promise<AccountWorkspaceRow | null> {
  if (!workspaceId) return null;

  const { data, error } = await supabase
    .from("account_workspace_ids")
    .select("*")
    .eq("workspace_id", workspaceId)
    .limit(1)
    .single();

  if (error) return null;

  return data;
}

export default selectAccountWorkspaceIds;
