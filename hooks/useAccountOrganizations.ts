import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useUserProvider } from "@/providers/UserProvder";
import { usePrivy } from "@privy-io/react-auth";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

import type { AccountOrganization } from "@/lib/organizations/AccountOrganization";

interface OrganizationsResponse {
  organizations: AccountOrganization[];
}

/**
 * Fetch account's organizations from the API.
 * The API resolves the account from the Bearer token — no query params needed.
 */
const fetchAccountOrganizations = async (
  accessToken: string,
): Promise<AccountOrganization[]> => {
  const response = await fetch(`${getClientApiBaseUrl()}/api/organizations`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  const data: OrganizationsResponse = await response.json();
  return data.organizations;
};

/**
 * Hook to get all organizations the account belongs to
 */
const useAccountOrganizations = (): UseQueryResult<AccountOrganization[]> => {
  const { userData } = useUserProvider();
  const { getAccessToken, authenticated } = usePrivy();
  return useQuery({
    queryKey: ["accountOrganizations", userData?.account_id],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return fetchAccountOrganizations(accessToken!);
    },
    enabled: !!userData?.account_id && authenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export default useAccountOrganizations;
