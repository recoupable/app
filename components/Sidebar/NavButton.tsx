import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import type { LucideIcon } from "lucide-react";

interface NavButtonProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isExpanded?: boolean;
  onClick: () => void;
  shouldRender?: boolean;
  "aria-label"?: string;
  onHover?: () => void;
}

const NavButton = ({
  icon: Icon,
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
        "rounded-lg whitespace-nowrap overflow-hidden transition-colors duration-200 h-11 md:h-9 relative text-sm font-normal",
        isExpanded
          ? "w-full flex justify-start gap-2 px-3"
          : "w-8 mx-auto gap-0",
        {
          "bg-muted text-foreground hover:bg-muted font-medium": isActive,
          "text-muted-foreground hover:bg-muted hover:text-foreground":
            !isActive,
        },
      )}
      aria-label={ariaLabel || label}
    >
      <Icon
        size={18}
        strokeWidth={1.5}
        aria-hidden="true"
        className="shrink-0"
      />
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
