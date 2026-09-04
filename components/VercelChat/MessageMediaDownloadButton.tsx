import { Download } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "@/lib/utils";

/** Overlay placement: an icon sitting on top of an image tile, revealed on hover. */
const OVERLAY_CLASSNAME =
  "absolute top-2 right-2 z-20 md:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-accent/50";

interface MessageMediaDownloadButtonProps {
  onClick: () => void;
  /** Renders a labelled inline button instead of the hover-overlay icon. */
  label?: string;
  overrideButtonClassName?: string;
  overrideIconClassName?: string;
  isReady?: boolean;
  isDownloading?: boolean;
}

/**
 * The download control for any generated asset in a message.
 *
 * Two shapes, one component: an icon overlaid on an image tile (default), or
 * a labelled inline button when the media sits in its own row and there is
 * nothing to overlay.
 */
const MessageMediaDownloadButton = ({
  onClick,
  label,
  overrideButtonClassName,
  overrideIconClassName,
  isReady = true,
  isDownloading = false,
}: MessageMediaDownloadButtonProps) => {
  const button = (
    <Button
      type="button"
      variant={label ? "outline" : "ghost"}
      size={label ? "sm" : "icon"}
      className={cn(
        label ? "w-fit" : OVERLAY_CLASSNAME,
        overrideButtonClassName,
      )}
      onClick={onClick}
      disabled={isDownloading}
      aria-label={label ?? "Download"}
    >
      <Download
        className={cn(
          "h-4 w-4 text-foreground",
          label && "mr-2",
          isDownloading && "animate-pulse",
          overrideIconClassName,
        )}
      />
      {label}
    </Button>
  );

  // A labelled button says what it does; the bare icon needs the tooltip.
  if (label) return button;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{isReady ? "Download" : "Preparing download..."}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MessageMediaDownloadButton;
