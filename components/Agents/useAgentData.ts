import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AgentTemplateRow } from "@/types/AgentTemplates";
import fetchAgentTemplates from "@/lib/agent-templates/fetchAgentTemplates";
import { useAgentTemplateScope } from "./useAgentTemplateScope";

export type Agent = AgentTemplateRow;

export function useAgentData({ enabled = true }: { enabled?: boolean } = {}) {
  const scope = useAgentTemplateScope();
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState("Recommended");
  const [showAllTags, setShowAllTags] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const options = {
    queryKey: [...scope.cachePrefix, scope.scopeKey],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      scope.request(
        (token, requestSignal) =>
          fetchAgentTemplates(scope.apiBaseUrl, token, requestSignal),
        signal,
      ),
    // Keep hover-prefetched data fresh when the page/form reader mounts.
    staleTime: 5 * 60 * 1000,
    gcTime: 0,
    retry: false,
  };
  const query = useQuery({ ...options, enabled: scope.ready && enabled });
  // Derive displayed data; never retain a second copy across authentication changes.
  const agents = scope.ready && !query.error ? (query.data ?? []) : [];
  const actionTags = [
    "Deep Research",
    "Send Report",
    "Email Outreach",
    "Scheduled Action",
    "Creative Content",
  ];
  const tags = Array.from(
    new Set([
      "Recommended",
      ...agents
        .flatMap((agent) => agent.tags ?? [])
        .filter((tag) => !!tag && !actionTags.includes(tag)),
    ]),
  );
  const gridAgents = agents.filter(
    (agent) =>
      agent.title !== "Audience Segmentation" &&
      (selectedTag === "Recommended" || agent.tags?.includes(selectedTag)) &&
      (isPrivate ? agent.is_private : !agent.is_private),
  );
  return {
    tags,
    selectedTag,
    setSelectedTag,
    loading: scope.ready && query.isPending,
    error: query.error,
    refetch: query.refetch,
    scopeKey: scope.scopeKey,
    ready: scope.ready,
    showAllTags,
    setShowAllTags,
    gridAgents,
    isPrivate,
    togglePrivate: () => setIsPrivate(!isPrivate),
    prefetchAgents: () => {
      if (scope.ready) void queryClient.prefetchQuery(options);
    },
  };
}
