import supabase from "@/lib/supabase/serverClient";

/**
 * Link a workspace to an owner account
 *
 * @param accountId - The owner's account ID
 * @param workspaceId - The workspace account ID
 * @returns The created record or null if failed
 */
export async function insertAccountWorkspaceId(
  accountId: string,
  workspaceId: string,
): Promise<{ id: string } | null> {
  if (!accountId || !workspaceId) return null;

  try {
    const { data, error } = await supabase
      .from("account_workspace_ids")
      .insert({
        account_id: accountId,
        workspace_id: workspaceId,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error inserting account_workspace_id:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error inserting account_workspace_id:", error);
    return null;
  }
}

export default insertAccountWorkspaceId;
