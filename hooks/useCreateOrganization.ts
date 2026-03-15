import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useUserProvider } from "@/providers/UserProvder";
import { NEW_API_BASE_URL } from "@/lib/consts";

/**
 * Hook to handle creating a new organization.
 * Encapsulates API call, loading state, and success handling.
 */
const useCreateOrganization = () => {
  const { isCreateOrgOpen, closeCreateOrg, setSelectedOrgId } = useOrganization();
  const { userData } = useUserProvider();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createOrganization = useCallback(async () => {
    if (!name.trim() || !userData?.account_id) return false;

    setIsCreating(true);
    try {
      const response = await fetch(`${NEW_API_BASE_URL}/api/organizations`, {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          accountId: userData.account_id,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        // Invalidate the organizations query to refetch
        await queryClient.invalidateQueries({ queryKey: ["accountOrganizations"] });
        // Select the new org
        setSelectedOrgId(data.organization.id);
        // Reset and close
        setName("");
        closeCreateOrg();
        return true;
      }
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [name, userData?.account_id, queryClient, setSelectedOrgId, closeCreateOrg]);

  const handleClose = useCallback(() => {
    setName("");
    closeCreateOrg();
  }, [closeCreateOrg]);

  return {
    isCreateOrgOpen,
    name,
    setName,
    isCreating,
    createOrganization,
    handleClose,
  };
};

export default useCreateOrganization;
