import { useLayoutEffect, useRef, useState } from "react";
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
  const mounted = useRef(true);
  const controllers = useRef(new Set<AbortController>());
  useLayoutEffect(() => {
    mounted.current = true;
    const pending = controllers.current;
    return () => {
      mounted.current = false;
      pending.forEach((controller) => controller.abort());
      pending.clear();
    };
  }, [scope.scopeKey]);
  const mutate = async (options: TemplateRequest, onSuccess?: () => void) => {
    const controller = new AbortController();
    controllers.current.add(controller);
    const isCurrent = () =>
      mounted.current && !controller.signal.aborted && scope.isCurrent();
    if (!isCurrent()) {
      controllers.current.delete(controller);
      return;
    }
    setPendingScope(scope.scopeKey);
    try {
      await scope.request(
        (token, signal) =>
          requestAgentTemplates(scope.apiBaseUrl, token, signal, options),
        controller.signal,
      );
      if (!isCurrent()) return;
      void queryClient.invalidateQueries({ queryKey: scope.cachePrefix });
      onSuccess?.();
    } catch (error) {
      if (isCurrent())
        toast.error(
          error instanceof Error ? error.message : "Unable to update agents.",
        );
    } finally {
      controllers.current.delete(controller);
      if (isCurrent()) setPendingScope(null);
    }
  };
  return {
    mutate,
    isPending: pendingScope === scope.scopeKey,
    ready: scope.ready,
    scopeKey: scope.scopeKey,
  };
}
