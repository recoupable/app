import AgentsNavItem from "./AgentsNavItem";
import TasksNavItem from "./TasksNavItem";
import FilesNavItem from "./FilesNavItem";

interface SecondaryNavProps {
  isExpanded: boolean;
  isAgents: boolean;
  isTasks: boolean;
  isFiles: boolean;
  onNavigate: (path: string) => void;
}

const SecondaryNav = ({
  isExpanded,
  isAgents,
  isTasks,
  isFiles,
  onNavigate,
}: SecondaryNavProps) => (
  <div className="flex flex-col gap-1 w-full mt-3">
    <AgentsNavItem isActive={isAgents} isExpanded={isExpanded} onClick={() => onNavigate("agents")} />
    <TasksNavItem isActive={isTasks} isExpanded={isExpanded} onClick={() => onNavigate("tasks")} />
    <FilesNavItem isActive={isFiles} isExpanded={isExpanded} onClick={() => onNavigate("files")} />
  </div>
);

export default SecondaryNav;
