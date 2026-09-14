import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import MenuItemIcon from "../MenuItemIcon";
import { IconsType } from "../Icon";

interface NavButtonProps {
  icon: IconsType;
  label: string;
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
  shouldRender?: boolean;
  "aria-label"?: string;
  onHover?: () => void;
}

const NavButton = ({
  icon,
  label,
  isActive,
  isExpanded = true,
  onClick,
  shouldRender = true,
  "aria-label": ariaLabel,
  onHover,
}: NavButtonProps) => {
  if (!shouldRender) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size={isExpanded ? "sm" : "icon"}
      onClick={onClick}
      onMouseEnter={onHover}
      className={cn(
        "rounded-xl whitespace-nowrap overflow-hidden transition-colors duration-200 h-11 md:h-10 relative text-sm font-normal",
        isExpanded
          ? "w-full flex justify-start gap-2 px-3"
          : "w-8 mx-auto gap-0",
        {
          "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent font-medium":
            isActive,
          "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground":
            !isActive,
        },
      )}
      aria-label={ariaLabel || label}
    >
      {/* Active page accent bar */}
      {isActive && isExpanded && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-brand" />
      )}
      <MenuItemIcon name={icon} />
      <span
        className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0",
        )}
      >
        {label}
      </span>
    </Button>
  );
};

export default NavButton;
