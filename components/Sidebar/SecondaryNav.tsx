import AgentsNavItem from "./AgentsNavItem";
import TasksNavItem from "./TasksNavItem";
import FanGroupNavItem from "./FanGroupNavItem";
import FilesNavItem from "./FilesNavItem";
import LaunchNavItem from "./LaunchNavItem";

interface SecondaryNavProps {
  isExpanded: boolean;
  isAgents: boolean;
  isTasks: boolean;
  isSegments: boolean;
  isFiles: boolean;
  isLaunch: boolean;
  onNavigate: (path: string) => void;
}

const SecondaryNav = ({
  isExpanded,
  isAgents,
  isTasks,
  isSegments,
  isFiles,
  isLaunch,
  onNavigate,
}: SecondaryNavProps) => (
  <div className="flex flex-col gap-1 w-full mt-3">
    <LaunchNavItem isActive={isLaunch} isExpanded={isExpanded} onClick={() => onNavigate("launch")} />
    <AgentsNavItem isActive={isAgents} isExpanded={isExpanded} onClick={() => onNavigate("agents")} />
    <TasksNavItem isActive={isTasks} isExpanded={isExpanded} onClick={() => onNavigate("tasks")} />
    <FanGroupNavItem isActive={isSegments} isExpanded={isExpanded} onClick={() => onNavigate("segments")} />
    <FilesNavItem isActive={isFiles} isExpanded={isExpanded} onClick={() => onNavigate("files")} />
  </div>
);

export default SecondaryNav;
