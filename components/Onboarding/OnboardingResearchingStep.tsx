"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const RESEARCH_STAGES = [
  { label: "Analyzing fan segments & demographics", icon: "📊" },
  { label: "Pulling streaming data & release history", icon: "🎵" },
  { label: "Scanning upcoming tour & release windows", icon: "📅" },
  { label: "Benchmarking against similar artists", icon: "🔍" },
  { label: "Generating proactive task recommendations", icon: "✅" },
  { label: "Building your artist intelligence files", icon: "🧠" },
];

interface Props {
  artistNames: string[];
  onComplete: () => void;
}

export function OnboardingResearchingStep({ artistNames, onComplete }: Props) {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCompletedStages(prev => [...prev, currentStage]);
      setCurrentStage(prev => {
        const next = prev + 1;
        if (next >= RESEARCH_STAGES.length) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
        return next;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [onComplete]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayArtists = artistNames.slice(0, 3);
  const overflow = artistNames.length - 3;

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Animated logo / pulse */}
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 animate-ping rounded-full bg-primary/20" />
        <div className="absolute h-16 w-16 animate-pulse rounded-full bg-primary/30" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl shadow-lg">
          🧠
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold tracking-tight">
          Running deep research
          {displayArtists.length > 0 && (
            <>
              {" on "}
              <span className="text-primary">
                {displayArtists.join(", ")}
                {overflow > 0 && ` +${overflow} more`}
              </span>
            </>
          )}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This usually takes just a moment. Get ready to be impressed.
        </p>
      </div>

      {/* Stage progress */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        {RESEARCH_STAGES.map((stage, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all duration-500",
              completedStages.includes(i)
                ? "bg-primary/10 text-foreground"
                : currentStage === i
                ? "bg-muted/60 text-foreground animate-pulse"
                : "text-muted-foreground/40",
            )}
          >
            <span className={cn("text-base transition-all", completedStages.includes(i) ? "opacity-100" : "opacity-30")}>
              {completedStages.includes(i) ? "✅" : stage.icon}
            </span>
            <span>{stage.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
