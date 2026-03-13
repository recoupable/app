import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useUserProvider } from "@/providers/UserProvder";
import { useAccessToken } from "@/hooks/useAccessToken";
import { NEW_API_BASE_URL } from "@/lib/consts";

export interface AccountOrganization {
  id: string;
  organization_id: string;
  organization_name?: string;
  organization_image?: string;
}

interface OrganizationsResponse {
  organizations: AccountOrganization[];
}

/**
 * Fetch account's organizations from the API.
 * The API resolves the account from the Bearer token — no query params needed.
 *
 * @param accessToken
 */
const fetchAccountOrganizations = async (accessToken: string): Promise<AccountOrganization[]> => {
  const response = await fetch(`${NEW_API_BASE_URL}/api/organizations`, {
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
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: ["accountOrganizations", userData?.account_id],
    queryFn: () => fetchAccountOrganizations(accessToken!),
    enabled: !!userData?.account_id && !!accessToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

export default useAccountOrganizations;
