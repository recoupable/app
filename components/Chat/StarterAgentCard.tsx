import type React from "react";
import { type Agent } from "@/hooks/useAgentData";

interface StarterAgentCardProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
}

const StarterAgentCard: React.FC<StarterAgentCardProps> = ({
  agent,
  onClick,
}) => {
  return (
    <button
      type="button"
      className="w-full bg-card border border-border/60 rounded-lg px-4 py-3 hover:border-border hover:shadow-md transition-all duration-200 text-left group hover:-translate-y-px"
      onClick={() => onClick(agent)}
    >
      <div className="text-sm font-semibold text-foreground leading-tight group-hover:text-foreground transition-colors">
        {agent.title}
      </div>
      <div className="text-muted-foreground text-xs leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-300 max-h-0 group-hover:max-h-32 overflow-hidden mt-1">
        {agent.description}
      </div>
    </button>
  );
};

export default StarterAgentCard;
