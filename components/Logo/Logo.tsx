import React from "react";
import { cn } from "@/lib/utils";
import LogoIcon from "./LogoIcon";

export type LogoProps = React.ComponentProps<"div"> & { isExpanded?: boolean };

const Logo = ({ isExpanded = false, className, ...divProps }: LogoProps) => {
  return (
    <div
      className={cn(
        "flex items-center text-foreground",
        isExpanded ? "gap-2" : "gap-0",
        className,
      )}
      {...divProps}
    >
      <div className="w-[21px] flex justify-center items-center shrink-0">
        <LogoIcon className="w-[20px] h-auto" />
      </div>
      {/* Brand name — fades in/out alongside sidebar */}
      <span
        className={cn(
          "font-semibold text-[24px] leading-none tracking-[-0.8px] whitespace-nowrap overflow-hidden transition-all duration-200 font-heading",
          isExpanded ? "opacity-100 max-w-[150px]" : "opacity-0 max-w-0",
        )}
      >
        Recoup
      </span>
    </div>
  );
};

export default Logo;
