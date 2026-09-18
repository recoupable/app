import { Bot } from "lucide-react";
import { useAgentData } from "../Agents/useAgentData";
import NavButton from "./NavButton";

const AgentsNavItem = ({
  isActive,
  isExpanded,
  onClick,
}: {
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
}) => {
  const { prefetchAgents } = useAgentData();

  return (
    <NavButton
      icon={Bot}
      label="Agents"
      isActive={isActive}
      isExpanded={isExpanded}
      onClick={onClick}
      aria-label="View agents"
      onHover={prefetchAgents}
    />
  );
};

export default AgentsNavItem;
