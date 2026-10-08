import { useState, useCallback, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

interface UseAddArtistToOrganizationOptions {
  onSuccess?: (orgId: string) => void;
}

/** Uses the existing authorized membership endpoint and refreshes cached rosters. */
const useAddArtistToOrganization = (
  options?: UseAddArtistToOrganizationOptions,
) => {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const pending = useRef(false);
  const [addingToOrgId, setAddingToOrgId] = useState<string | null>(null);
  const [addedToOrgId, setAddedToOrgId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addArtistToOrganization = useCallback(
    async (artistId: string, organizationId: string) => {
      if (pending.current) return false;
      pending.current = true;
      setAddingToOrgId(organizationId);
      setAddedToOrgId(null);
      setError(null);
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) throw new Error("Please sign in to add an artist.");
        const response = await fetch(
          `${getClientApiBaseUrl()}/api/organizations/artists`,
          {
            method: "POST",
            body: JSON.stringify({ artistId, organizationId }),
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const body = await response.json();
        if (!response.ok || body.status !== "success") {
          throw new Error(body.error || "Could not add artist. Please retry.");
        }
        await queryClient.invalidateQueries({ queryKey: ["artists"] });
        setAddedToOrgId(organizationId);
        options?.onSuccess?.(organizationId);
        return true;
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not add artist. Please retry.",
        );
        return false;
      } finally {
        pending.current = false;
        setAddingToOrgId(null);
      }
    },
    [options, getAccessToken, queryClient],
  );

  return {
    addArtistToOrganization,
    addingToOrgId,
    addedToOrgId,
    error,
    isAdding: addingToOrgId !== null,
  };
};

export default useAddArtistToOrganization;
