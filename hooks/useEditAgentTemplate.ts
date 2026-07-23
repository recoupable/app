import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserProvider } from "@/providers/UserProvder";
import type { AgentTemplateRow } from "@/types/AgentTemplates";
import type { CreateAgentFormData } from "@/components/Agents/schemas";

interface UseEditAgentTemplateOptions {
  agent: AgentTemplateRow;
  currentSharedEmails: string[];
  onSuccess: () => void;
}

export function useEditAgentTemplate({
  agent,
  currentSharedEmails,
  onSuccess,
}: UseEditAgentTemplateOptions) {
  const { userData } = useUserProvider();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateAgentFormData) => {
      const finalShareEmails = values.isPrivate
        ? [...currentSharedEmails, ...(values.shareEmails ?? [])]
        : [];

      const res = await fetch("/api/agent-templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: agent.id,
          userId: userData?.id,
          title: values.title,
          description: values.description,
          prompt: values.prompt,
          tags: values.tags,
          isPrivate: values.isPrivate,
          shareEmails: finalShareEmails,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update template");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-templates"] });
      onSuccess();
    },
  });
}
