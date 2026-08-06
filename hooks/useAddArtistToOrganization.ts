import { useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface UseAddArtistToOrganizationOptions {
  onSuccess?: (orgId: string) => void;
}

/**
 * Hook to handle adding an artist to an organization.
 * Manages loading state and API call.
 */
const useAddArtistToOrganization = (options?: UseAddArtistToOrganizationOptions) => {
  const { getAccessToken } = usePrivy();
  const [addingToOrgId, setAddingToOrgId] = useState<string | null>(null);

  const addArtistToOrganization = useCallback(
    async (artistId: string, organizationId: string) => {
      setAddingToOrgId(organizationId);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          return false;
        }

        const response = await fetch(`${getClientApiBaseUrl()}/api/organizations/artists`, {
          method: "POST",
          body: JSON.stringify({
            artistId,
            organizationId,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          options?.onSuccess?.(organizationId);
          return true;
        }
        return false;
      } finally {
        setAddingToOrgId(null);
      }
    },
    [options, getAccessToken]
  );

  return {
    addArtistToOrganization,
    addingToOrgId,
    isAdding: addingToOrgId !== null,
  };
};

export default useAddArtistToOrganization;

