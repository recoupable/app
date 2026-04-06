import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import type { AccountWithDetails } from "@/lib/supabase/accounts/getAccountWithDetails";

interface FetchOrCreateAccountResponse {
  data: AccountWithDetails;
}

/**
 * Creates or retrieves the current account from the dedicated API.
 */
export async function fetchOrCreateAccount({
  email,
  wallet,
  accessToken,
}: {
  email?: string;
  wallet?: string;
  accessToken?: string | null;
}): Promise<AccountWithDetails> {
  const response = await fetch(`${getClientApiBaseUrl()}/api/accounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      email,
      wallet,
    }),
  });

  if (!response.ok) {
    throw new Error(`Account API request failed with status: ${response.status}`);
  }

  const data: FetchOrCreateAccountResponse = await response.json();
  return data.data;
}
