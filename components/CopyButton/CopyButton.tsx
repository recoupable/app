"use client";

import { Check, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useCopy } from "@/hooks/useCopy";
import { cn } from "@/lib/utils";

/**
 * Copies text to the clipboard and swaps to a tick to confirm.
 *
 * The only copy control in the app. `useCopy` owns the clipboard call, the
 * copied state and the reset timer; this owns how that control looks.
 *
 * Always a `Button`. Callers that need different chrome — the chat message
 * toolbar wants the ghost, rounded, muted treatment its neighbours share —
 * pass it as `className`, so the styling is visible at the call site rather
 * than selected by a branch in here.
 *
 * @param text - What to copy.
 * @param label - Names the target for a screen reader, and is shown beside the
 *   icon when `showLabel` is set. Icon-only otherwise.
 * @param tooltip - Wraps the button in a tooltip when set.
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

  const button = (
    <Button
      type="button"
      variant={variant}
      size={size ?? (showLabel ? "sm" : "icon")}
      onClick={() => copy(text)}
      aria-label={`Copy ${label}`}
      className={className}
    >
      <Icon className={cn("size-4", iconClassName)} />
      {showLabel && (copied ? "Copied!" : `Copy ${label}`)}
    </Button>
  );

  if (!tooltip) return button;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyButton;
