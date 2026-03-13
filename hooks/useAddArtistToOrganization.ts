import { useState, useCallback } from "react";
import { NEW_API_BASE_URL } from "@/lib/consts";

interface UseAddArtistToOrganizationOptions {
  onSuccess?: (orgId: string) => void;
}

/**
 * Hook to handle adding an artist to an organization.
 * Manages loading state and API call.
 *
 * @param options
 */
const useAddArtistToOrganization = (options?: UseAddArtistToOrganizationOptions) => {
  const [addingToOrgId, setAddingToOrgId] = useState<string | null>(null);

  const addArtistToOrganization = useCallback(
    async (artistId: string, organizationId: string) => {
      setAddingToOrgId(organizationId);
      try {
        const response = await fetch(`${NEW_API_BASE_URL}/api/organizations/artists`, {
          method: "POST",
          body: JSON.stringify({
            artistId,
            organizationId,
          }),
          headers: { "Content-Type": "application/json" },
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
    [options],
  );

  return {
    addArtistToOrganization,
    addingToOrgId,
    isAdding: addingToOrgId !== null,
  };
};

export default useAddArtistToOrganization;
