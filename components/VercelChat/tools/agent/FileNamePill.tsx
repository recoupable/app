"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function getFileName(filePath: string): string {
  const parts = filePath.split("/");
  return parts[parts.length - 1] || filePath;
}

export function FileNamePill({
  filePath,
  fullPath,
  error = false,
}: {
  filePath: string;
  fullPath?: string;
  error?: boolean;
}) {
  const fileName = getFileName(filePath);
  const tooltipPath = fullPath ?? filePath;
  const showTooltip = tooltipPath !== fileName;

  const pill = (
    <span
      className={cn(
        "inline-flex max-w-[220px] items-center rounded border px-1.5 py-0.5 font-mono text-[12px] leading-tight",
        error
          ? "border-red-500/30 bg-red-500/10 text-red-400"
          : "border-border/80 bg-muted/60 text-muted-foreground",
      )}
    >
      <FileText className="mr-1 h-3.5 w-3.5 shrink-0" />
      <span className="truncate">{fileName}</span>
    </span>
  );

  if (!showTooltip) return pill;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{pill}</TooltipTrigger>
        <TooltipContent side="top">
          <span className="font-mono text-xs">{tooltipPath}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
