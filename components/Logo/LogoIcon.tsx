import React from "react";
import { cn } from "@/lib/utils";

export type LogoIconProps = React.ComponentProps<"svg">;

/**
 * Recoup logo icon rendered as inline SVG with currentColor.
 * Automatically adapts to light/dark mode via the text color.
 */
const LogoIcon = ({ className, ...props }: LogoIconProps) => (
  <svg
    width="21"
    height="23"
    viewBox="48 41 127 141"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className)}
    aria-hidden="true"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M118.106 41C112.845 41 108.581 45.2558 108.581 50.5056V88.3242C108.581 93.9241 106.846 99.3868 103.613 103.964C98.5169 111.179 90.2239 115.471 81.3785 115.471H57.525C52.2645 115.471 48 119.727 48 124.977V172.304C48 177.554 52.2645 181.81 57.525 181.81H104.894C110.155 181.81 114.419 177.554 114.419 172.304V139.968C114.419 133.432 116.445 127.056 120.218 121.714L120.885 120.77C126.833 112.348 136.512 107.339 146.836 107.339H165.475C170.736 107.339 175 103.083 175 97.833V50.5056C175 45.2558 170.736 41 165.475 41H118.106Z"
      fill="currentColor"
    />
  </svg>
);

export default LogoIcon;
