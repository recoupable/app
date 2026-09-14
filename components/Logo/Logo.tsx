import React from "react";
import { cn } from "@/lib/utils";
import LogoIcon from "./LogoIcon";

export type LogoProps = React.ComponentProps<"div"> & { isExpanded?: boolean };

const Logo = ({ isExpanded = false, className, ...divProps }: LogoProps) => {
  return (
    <div
      className={cn(
        "flex items-center",
        isExpanded ? "gap-2.5" : "gap-0",
        className,
      )}
      {...divProps}
    >
      <div className="w-[21px] flex justify-center items-center shrink-0">
        <LogoIcon className="w-[20px] h-auto text-brand" />
      </div>
      {/* Brand name — fades in/out alongside sidebar */}
      <span
        className={cn(
          "font-semibold text-[28px] tracking-[-1.1px] text-foreground whitespace-nowrap overflow-hidden transition-all duration-200 font-heading",
          isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0",
        )}
      >
        Recoup
      </span>
    </div>
  );
};

export default Logo;
