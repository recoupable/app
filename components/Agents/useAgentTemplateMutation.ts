import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  requestAgentTemplates,
  type TemplateRequest,
} from "@/lib/agent-templates/requestAgentTemplates";
import { useAgentTemplateScope } from "./useAgentTemplateScope";

export function useAgentTemplateMutation() {
  const scope = useAgentTemplateScope();
  const queryClient = useQueryClient();
  const [pendingScope, setPendingScope] = useState<string | null>(null);
  const mutate = async (options: TemplateRequest, onSuccess?: () => void) => {
    setPendingScope(scope.scopeKey);
    try {
      await scope.request((token, signal) =>
        requestAgentTemplates(scope.apiBaseUrl, token, signal, options),
      );
      if (!scope.isCurrent()) return;
      void queryClient.invalidateQueries({ queryKey: scope.cachePrefix });
      onSuccess?.();
    } catch (error) {
      if (scope.isCurrent())
        toast.error(
          error instanceof Error ? error.message : "Unable to update agents.",
        );
    } finally {
      if (scope.isCurrent()) setPendingScope(null);
    }
  };
  return {
    mutate,
    isPending: pendingScope === scope.scopeKey,
    ready: scope.ready,
    scopeKey: scope.scopeKey,
  };
}
