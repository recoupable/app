import NavButton from "./NavButton";

const CatalogsNavItem = ({
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
