import selectAccountWorkspaceIds from "@/lib/supabase/account_workspace_ids/selectAccountWorkspaceIds";

/**
 * Check if an account is a workspace
 *
 * @param accountId
 */
export async function isWorkspaceAccount(accountId: string): Promise<boolean> {
  const row = await selectAccountWorkspaceIds(accountId);
  return row !== null;
}

export default isWorkspaceAccount;
