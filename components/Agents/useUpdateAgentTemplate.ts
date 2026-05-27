"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import updateAgentTemplate, {
  type UpdateAgentTemplateBody,
} from "@/lib/agent-templates/updateAgentTemplate";

/**
 * Mutation hook for updating an agent template via the dedicated API.
 * Invalidates the `agent-templates` list on success.
 */
export function useUpdateAgentTemplate(templateId: string) {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: UpdateAgentTemplateBody) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Not authenticated");
      return updateAgentTemplate(accessToken, templateId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-templates"] });
    },
  });
}
