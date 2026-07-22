"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Section } from "@/hooks/useLaunchCampaign";

interface CampaignSectionProps {
  section: Section;
}

export function CampaignSection({ section }: CampaignSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(section.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300",
        section.status === "pending" && "border-border bg-muted/30 opacity-50",
        section.status === "generating" && "border-[#345A5D]/40 bg-[#345A5D]/5 shadow-sm shadow-[#345A5D]/10",
        section.status === "complete" && "border-border bg-background shadow-sm",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{section.emoji}</span>
          <span className="font-semibold text-sm text-foreground">{section.label}</span>
        </div>
        <div className="flex items-center gap-2">
          {section.status === "generating" && (
            <span className="flex items-center gap-1.5 text-xs text-[#345A5D] font-medium">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#345A5D] animate-pulse" />
              Writing...
            </span>
          )}
          {section.status === "complete" && (
            <>
              <span className="text-xs text-green-600 font-medium">Done</span>
              <button
                onClick={handleCopy}
                className="text-xs px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </>
          )}
          {section.status === "pending" && (
            <span className="text-xs text-muted-foreground">Waiting...</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 min-h-[80px]">
        {section.status === "pending" && (
          <div className="flex flex-col gap-2">
            <div className="h-3 bg-muted rounded-full w-3/4 animate-pulse" />
            <div className="h-3 bg-muted rounded-full w-1/2 animate-pulse" />
          </div>
        )}
        {(section.status === "generating" || section.status === "complete") && section.content && (
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-sans">
            {section.content}
            {section.status === "generating" && (
              <span className="inline-block w-0.5 h-4 bg-[#345A5D] ml-0.5 animate-pulse align-middle" />
            )}
          </p>
        )}
        {section.status === "generating" && !section.content && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#345A5D] border-t-transparent" />
            Starting...
          </div>
        )}
      </div>
    </div>
  );
}
