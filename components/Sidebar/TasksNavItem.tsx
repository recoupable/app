import { Clock3 } from "lucide-react";
import NavButton from "./NavButton";

const TasksNavItem = ({
  isActive,
  isExpanded,
  onClick,
}: {
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
}) => {
  return (
    <NavButton
      icon={Clock3}
      label="Tasks"
      isActive={isActive}
      isExpanded={isExpanded}
      onClick={onClick}
      aria-label="View tasks"
    />
  );
};

export default TasksNavItem;
