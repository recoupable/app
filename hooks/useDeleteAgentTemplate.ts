"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import deleteAgentTemplate from "@/lib/agent-templates/deleteAgentTemplate";

/**
 * Mutation hook for deleting an agent template via the dedicated API.
 * Invalidates the `agent-templates` list on success.
 */
export function useDeleteAgentTemplate(templateId: string) {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Not authenticated");
      return deleteAgentTemplate(accessToken, templateId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-templates"] });
    },
  });
}
