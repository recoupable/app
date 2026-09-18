import { Music2 } from "lucide-react";
import NavButton from "./NavButton";

export interface MusicNavItemProps {
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
}

const MusicNavItem = ({ isActive, isExpanded, onClick }: MusicNavItemProps) => {
  return (
    <NavButton
      icon={Music2}
      label="Music"
      isActive={isActive}
      isExpanded={isExpanded}
      onClick={onClick}
      aria-label="View music"
    />
  );
};

export default MusicNavItem;
