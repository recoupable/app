"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import createAgentTemplate, {
  type CreateAgentTemplateBody,
} from "@/lib/agent-templates/createAgentTemplate";

/**
 * Mutation hook for creating an agent template via the dedicated API.
 * Invalidates the `agent-templates` list on success.
 */
export function useCreateAgentTemplate() {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CreateAgentTemplateBody) => {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Not authenticated");
      return createAgentTemplate(accessToken, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-templates"] });
    },
  });
}
