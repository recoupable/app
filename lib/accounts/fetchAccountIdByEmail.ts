import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

/**
 * Fetches an account ID by email address via GET /api/accounts/{email}.
 *
 * @param email - The email address to look up
 * @param accessToken - Bearer token for authentication
 * @returns The account ID, or null if not found
 */
export async function fetchAccountIdByEmail(
  email: string,
  accessToken: string,
): Promise<string | null> {
  const baseUrl = getClientApiBaseUrl();
  const response = await fetch(
    `${baseUrl}/api/accounts/${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Account lookup failed: ${response.status}`);

  const data = await response.json();
  return data.account?.account_id ?? null;
}
