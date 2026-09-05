import NavButton from "./NavButton";

const BillingNavItem = ({
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
      icon="card"
      label="Billing"
      isActive={isActive}
      isExpanded={isExpanded}
      onClick={onClick}
      aria-label="View billing"
    />
  );
};

export default BillingNavItem;
