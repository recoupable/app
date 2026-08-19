import AgentsNavItem from "./AgentsNavItem";
import TasksNavItem from "./TasksNavItem";
import FilesNavItem from "./FilesNavItem";
import CatalogsNavItem from "./CatalogsNavItem";
import ArtistsNavItem from "./ArtistsNavItem";

interface SecondaryNavProps {
  isExpanded: boolean;
  isAgents: boolean;
  isTasks: boolean;
  isFiles: boolean;
  isCatalogs: boolean;
  isArtists: boolean;
  onNavigate: (path: string) => void;
}

const SecondaryNav = ({
  isExpanded,
  isAgents,
  isTasks,
  isFiles,
  isCatalogs,
  isArtists,
  onNavigate,
}: SecondaryNavProps) => (
  <div className="flex flex-col gap-1 w-full mt-3">
    <ArtistsNavItem isActive={isArtists} isExpanded={isExpanded} onClick={() => onNavigate("artists")} />
    <CatalogsNavItem isActive={isCatalogs} isExpanded={isExpanded} onClick={() => onNavigate("catalogs")} />
    <AgentsNavItem isActive={isAgents} isExpanded={isExpanded} onClick={() => onNavigate("agents")} />
    <TasksNavItem isActive={isTasks} isExpanded={isExpanded} onClick={() => onNavigate("tasks")} />
    <FilesNavItem isActive={isFiles} isExpanded={isExpanded} onClick={() => onNavigate("files")} />
  </div>
);

export default SecondaryNav;
