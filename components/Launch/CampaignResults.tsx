"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CampaignSection } from "./CampaignSection";
import type { Section } from "@/hooks/useLaunchCampaign";

interface CampaignResultsProps {
  sections: Section[];
  progress: number;
  isGenerating: boolean;
  isDone: boolean;
  onReset: () => void;
  artistName: string;
  songName: string;
}

export function CampaignResults({
  sections,
  progress,
  isGenerating,
  isDone,
  onReset,
  artistName,
  songName,
}: CampaignResultsProps) {
  const [allCopied, setAllCopied] = useState(false);

  const handleCopyAll = async () => {
    const allContent = sections
      .filter(s => s.status === "complete")
      .map(s => `## ${s.emoji} ${s.label}\n\n${s.content}`)
      .join("\n\n---\n\n");
    await navigator.clipboard.writeText(allContent);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            {isGenerating
              ? `Generating campaign for "${songName}" by ${artistName}...`
              : isDone
              ? `Campaign complete for "${songName}" by ${artistName}`
              : "Preparing..."}
          </span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-[#345A5D] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Section grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map(section => (
          <CampaignSection key={section.key} section={section} />
        ))}
      </div>

      {/* Actions */}
      {isDone && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            onClick={handleCopyAll}
            className="flex-1 h-11 bg-[#345A5D] hover:bg-[#2a4a4d] text-white rounded-xl font-semibold"
          >
            {allCopied ? "Copied to clipboard!" : "Copy Full Campaign"}
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1 h-11 rounded-xl font-semibold"
          >
            Generate Another Campaign
          </Button>
        </div>
      )}
    </div>
  );
}
