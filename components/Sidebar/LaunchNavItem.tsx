import NavButton from "./NavButton";

const LaunchNavItem = ({
  isActive,
  isExpanded,
  onClick,
}: {
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
}) => (
  <NavButton
    icon="star"
    label="Launch"
    isActive={isActive}
    isExpanded={isExpanded}
    onClick={onClick}
    aria-label="Release Autopilot"
  />
);

export default LaunchNavItem;
