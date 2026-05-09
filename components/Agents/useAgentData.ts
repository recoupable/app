import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import fetchAgentTemplates from "@/lib/agent-templates/fetchAgentTemplates";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

export type Agent = AgentTemplateRow;

export function useAgentData() {
  const { authenticated, getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedTag, setSelectedTag] = useState("Recommended");
  const [tags, setTags] = useState<string[]>(["Recommended"]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const { data, isPending } = useQuery<Agent[]>({
    queryKey: ["agent-templates"],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error("Missing access token");
      return fetchAgentTemplates(token);
    },
    retry: 1,
    enabled: authenticated,
  });

  useEffect(() => {
    if (!data) return;
    setAgents(data);
    // Action tags that should NOT appear in top filters (now multi-word)
    const actionTags = [
      "Deep Research",
      "Send Report",
      "Email Outreach",
      "Scheduled Action",
      "Creative Content",
    ];
    // Build a unique tag list from all agents, excluding action tags
    const uniqueTags = Array.from(
      new Set(
        data
          .flatMap((agent: Agent) => agent.tags || [])
          .filter((tag: string) => !!tag && !actionTags.includes(tag)),
      ),
    );
    const allTags = ["Recommended", ...uniqueTags];
    setTags(Array.from(new Set(allTags)));
  }, [data]);

  const loading = isPending;

  // Toggle function to switch between public and private agent visibility
  const togglePrivate = () => setIsPrivate(!isPrivate);

  // Get all agents except the special card, filtered by the selected tag and public/private
  const filteredAgents = agents.filter(
    (agent) =>
      agent.title !== "Audience Segmentation" &&
      (selectedTag === "Recommended"
        ? true
        : agent.tags?.includes(selectedTag)) &&
      (isPrivate ? agent.is_private === true : agent.is_private !== true),
  );
  // Hide the "Audience Segmentation" card from UI - keep all other logic intact
  const gridAgents = filteredAgents;

  // Prefetch agent data for better performance on hover
  const prefetchAgents = async () => {
    if (!authenticated) return;
    const token = await getAccessToken();
    if (!token) return;
    queryClient.prefetchQuery({
      queryKey: ["agent-templates"],
      queryFn: () => fetchAgentTemplates(token),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  return {
    tags,
    selectedTag,
    setSelectedTag,
    loading,
    showAllTags,
    setShowAllTags,
    gridAgents,
    isPrivate,
    togglePrivate,
    prefetchAgents,
  };
}
