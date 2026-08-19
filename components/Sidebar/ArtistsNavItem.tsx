import NavButton from "./NavButton";

export interface ArtistsNavItemProps {
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
}

const ArtistsNavItem = ({
  isActive,
  isExpanded,
  onClick,
}: ArtistsNavItemProps) => {
  return (
    <NavButton
      icon="micval"
      label="Artists"
      isActive={isActive}
      isExpanded={isExpanded}
      onClick={onClick}
      aria-label="View artists"
    />
  );
};

export default ArtistsNavItem;
