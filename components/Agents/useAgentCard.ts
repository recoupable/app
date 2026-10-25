import { usePrivy } from "@privy-io/react-auth";
import { useCallback } from "react";
import { useUserProvider } from "@/providers/UserProvder";
import type { AgentTemplateRow } from "@/types/AgentTemplates";

type Agent = AgentTemplateRow;

interface UseAgentCardProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
  onToggleFavorite?: (agentId: string, nextFavourite: boolean) => void;
}

interface UseAgentCardReturn {
  // Status detection
  isSharedWithUser: boolean;

  // UI state
  pillTag: string;

  // Event handlers
  handleCardKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  handleCardClick: (event: React.MouseEvent<HTMLDivElement>) => void;

  // Utility functions
  handleToggleFavorite: (agentId: string, nextFavourite: boolean) => void;
}

export function useAgentCard({
  agent,
  onClick,
  onToggleFavorite,
}: UseAgentCardProps): UseAgentCardReturn {
  const { userData } = useUserProvider();
  const { authenticated } = usePrivy();

  // Define action tags that should be displayed in cards
  const actionTags = [
    "Deep Research",
    "Send Report",
    "Email Outreach",
    "Scheduled Action",
    "Creative Content",
  ];

  // Filter and prioritize action tags
  const displayedActionTags =
    agent.tags?.filter((tag) => actionTags.includes(tag)) || [];
  const pillTag = displayedActionTags[0] ?? agent.tags?.[0] ?? "General";

  // Check if this agent is shared with the current user
  // The API only returns private templates to their owner or share recipients;
  // recipient addresses are intentionally not disclosed to a non-owner.
  const isSharedWithUser = Boolean(
    authenticated &&
      agent.is_private &&
      userData?.account_id &&
      userData.account_id !== agent.creator?.id,
  );

  const handleCardKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      const tag = target.tagName?.toLowerCase();
      const isInteractive =
        target.isContentEditable ||
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        tag === "button";

      if (isInteractive) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick(agent);
      }
    },
    [onClick, agent],
  );

  const handleCardClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      const interactiveAncestor = target.closest(
        "button, [role='button'], input, textarea, select, a",
      );

      // Ignore clicks on interactive elements, but allow the card itself (role=button)
      if (
        (interactiveAncestor && interactiveAncestor !== event.currentTarget) ||
        target.isContentEditable
      ) {
        return;
      }

      onClick(agent);
    },
    [onClick, agent],
  );

  const handleToggleFavorite = useCallback(
    (agentId: string, nextFavourite: boolean) => {
      onToggleFavorite?.(agentId, nextFavourite);
    },
    [onToggleFavorite],
  );

  return {
    isSharedWithUser,
    pillTag,
    handleCardKeyDown,
    handleCardClick,
    handleToggleFavorite,
  };
}
