import AgentsNavItem from "./AgentsNavItem";
import TasksNavItem from "./TasksNavItem";
import FilesNavItem from "./FilesNavItem";
import BillingNavItem from "./BillingNavItem";
import CatalogsNavItem from "./CatalogsNavItem";
import MusicNavItem from "./MusicNavItem";
import ArtistsNavItem from "./ArtistsNavItem";

interface SecondaryNavProps {
  isExpanded: boolean;
  isAgents: boolean;
  isTasks: boolean;
  isFiles: boolean;
  isCatalogs: boolean;
  isArtists: boolean;
  isMusic: boolean;
  isBilling: boolean;
  onNavigate: (path: string) => void;
}

const SecondaryNav = ({
  isExpanded,
  isAgents,
  isTasks,
  isFiles,
  isCatalogs,
  isArtists,
  isMusic,
  isBilling,
  onNavigate,
}: SecondaryNavProps) => (
  <div className="flex flex-col gap-1 w-full mt-3">
    <ArtistsNavItem isActive={isArtists} isExpanded={isExpanded} onClick={() => onNavigate("artists")} />
    <CatalogsNavItem isActive={isCatalogs} isExpanded={isExpanded} onClick={() => onNavigate("catalogs")} />
    <MusicNavItem isActive={isMusic} isExpanded={isExpanded} onClick={() => onNavigate("music")} />
    <AgentsNavItem isActive={isAgents} isExpanded={isExpanded} onClick={() => onNavigate("agents")} />
    <TasksNavItem isActive={isTasks} isExpanded={isExpanded} onClick={() => onNavigate("tasks")} />
    <FilesNavItem isActive={isFiles} isExpanded={isExpanded} onClick={() => onNavigate("files")} />
    <BillingNavItem isActive={isBilling} isExpanded={isExpanded} onClick={() => onNavigate("billing")} />
  </div>
);

export default SecondaryNav;
