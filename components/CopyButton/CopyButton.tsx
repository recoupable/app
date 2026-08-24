"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/useCopy";

/**
 * Copies text to the clipboard and swaps to a tick to confirm.
 *
 * The single place this pattern lives. `useCopy` already owned the clipboard
 * call, the copied state and the toast; what kept getting rewritten was the
 * button around it, so callers each shipped their own markup for the same
 * control.
 *
 * @param text - What to copy.
 * @param label - Names the target for a screen reader, and is shown beside the
 *   icon when `showLabel` is set. Icon-only otherwise.
 */
const CopyButton = ({
  text,
  label,
  showLabel = false,
  variant = "outline",
  size,
  className,
}: {
  text: string;
  label: string;
  showLabel?: boolean;
  variant?: "outline" | "ghost";
  size?: "sm" | "icon";
  className?: string;
}) => {
  const { copied, copy } = useCopy();
  const Icon = copied ? Check : Copy;

  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (showLabel ? "sm" : "icon")}
      onClick={() => copy(text)}
      aria-label={`Copy ${label}`}
      className={className}
    >
      <Icon className="size-4" />
      {showLabel && (copied ? "Copied!" : `Copy ${label}`)}
    </Button>
  );
};

export default CopyButton;
