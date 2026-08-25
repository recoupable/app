"use client";

import { Check, Copy } from "lucide-react";
import { Action } from "@/components/actions";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/useCopy";
import { cn } from "@/lib/utils";

/**
 * Copies text to the clipboard and swaps to a tick to confirm.
 *
 * The only copy control in the app. `useCopy` owns the clipboard call, the
 * copied state and the reset timer; this owns every way that control is
 * presented, so the two cannot drift.
 *
 * @param text - What to copy.
 * @param label - Names the target for a screen reader, and is shown beside the
 *   icon when `showLabel` is set. Icon-only otherwise.
 * @param tooltip - Renders inside an `Action`, the toolbar control used beside
 *   Retry and Edit on a chat message, with this as its tooltip.
 * @param silent - Suppress the success toast, for callers whose own tick is
 *   already the confirmation and where a toast per copy would be noise.
 */
const CopyButton = ({
  text,
  label,
  tooltip,
  showLabel = false,
  silent = false,
  variant = "outline",
  size,
  className,
  iconClassName,
}: {
  text: string;
  label: string;
  tooltip?: string;
  showLabel?: boolean;
  silent?: boolean;
  variant?: "outline" | "ghost";
  size?: "sm" | "icon";
  className?: string;
  iconClassName?: string;
}) => {
  const { copied, copy } = useCopy(2000, { silent });
  const Icon = copied ? Check : Copy;
  const icon = <Icon className={cn("size-4", iconClassName)} />;

  // A tooltip means this sits in a message toolbar, where `Action` supplies the
  // ghost, rounded, muted treatment the neighbouring controls share.
  if (tooltip) {
    return (
      <Action onClick={() => copy(text)} label={`Copy ${label}`} tooltip={tooltip}>
        {icon}
      </Action>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size ?? (showLabel ? "sm" : "icon")}
      onClick={() => copy(text)}
      aria-label={`Copy ${label}`}
      className={className}
    >
      {icon}
      {showLabel && (copied ? "Copied!" : `Copy ${label}`)}
    </Button>
  );
};

export default CopyButton;
