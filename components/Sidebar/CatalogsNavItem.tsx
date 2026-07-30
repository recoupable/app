import NavButton from "./NavButton";

export interface CatalogsNavItemProps {
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
}

const CatalogsNavItem = ({
  isActive,
  isExpanded,
  onClick,
}: CatalogsNavItemProps) => {
  return (
    <NavButton
      icon="book"
      label="Catalogs"
      isActive={isActive}
      isExpanded={isExpanded}
      onClick={onClick}
      aria-label="View catalogs"
    />
  );
};

export default CatalogsNavItem;
