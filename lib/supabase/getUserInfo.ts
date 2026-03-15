import supabase from "./serverClient";

export interface UserInfo {
  name?: string;
  email?: string;
  instruction?: string;
  job_title?: string;
  role_type?: string;
  company_name?: string;
  organization?: string;
  knowledges?: unknown[];
}

/**
 * Gets the full user information from account_info and accounts tables
 *
 * @param accountId - The user's account ID
 * @returns The user info object or null if not found
 */
async function getUserInfo(accountId: string): Promise<UserInfo | null> {
  if (!accountId) {
    return null;
  }

  // Get user account info
  const { data: accountInfo } = await supabase
    .from("account_info")
    .select("instruction, organization, knowledges, job_title, role_type, company_name")
    .eq("account_id", accountId)
    .single();

  // Get user name from accounts table (email is in account_emails table)
  const { data: account } = await supabase
    .from("accounts")
    .select("name")
    .eq("id", accountId)
    .single();

  // Get user email from account_emails table
  const { data: accountEmail } = await supabase
    .from("account_emails")
    .select("email")
    .eq("account_id", accountId)
    .single();

  if (!accountInfo && !account && !accountEmail) {
    return null;
  }

  const userInfo = {
    name: account?.name,
    email: accountEmail?.email,
    instruction: accountInfo?.instruction,
    job_title: accountInfo?.job_title,
    role_type: accountInfo?.role_type,
    company_name: accountInfo?.company_name,
    organization: accountInfo?.organization,
    knowledges: accountInfo?.knowledges,
  };

  return userInfo;
}

export default getUserInfo;
