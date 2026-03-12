"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  artistNames: string[];
  name: string | undefined;
  connectedCount: number;
  pulseEnabled: boolean;
  onComplete: () => void;
}

/**
 * The "aha moment" reveal — everything they just set up, summarized as social proof.
 */
export function OnboardingCompleteStep({
  artistNames,
  name,
  connectedCount,
  pulseEnabled,
  onComplete,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  const summaryItems = [
    artistNames.length > 0 && {
      icon: "🎤",
      text: `Deep research running on ${artistNames.slice(0, 2).join(" & ")}${artistNames.length > 2 ? ` +${artistNames.length - 2} more` : ""}`,
    },
    connectedCount > 0 && {
      icon: "🔗",
      text: `${connectedCount} platform${connectedCount > 1 ? "s" : ""} connected`,
    },
    pulseEnabled && {
      icon: "⚡",
      text: "Pulse active — your first briefing arrives tomorrow",
    },
    {
      icon: "✅",
      text: "First week of tasks queued and ready",
    },
    {
      icon: "🧠",
      text: "AI is learning your artists, fans, and priorities right now",
    },
  ].filter(Boolean) as { icon: string; text: string }[];

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-7 text-center transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      {/* Celebration */}
      <div className="flex flex-col items-center gap-3">
        <div className="text-5xl">🚀</div>
        <h2 className="text-2xl font-bold tracking-tight leading-tight">
          {name ? `${name}, you're already ahead.` : "You're already ahead."}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          While your competitors are guessing, you have AI running intelligence on every move.
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-col gap-2.5 w-full text-left">
        {summaryItems.map((item, i) => (
          <div
            key={i}
            style={{ transitionDelay: `${100 + i * 80}ms` }}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3 text-sm transition-all duration-500",
              visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2",
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.text}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full">
        <Button onClick={onComplete} className="w-full text-base py-5">
          Open my dashboard 🎯
        </Button>
        <p className="text-xs text-muted-foreground">
          Your friends in music will want to know what you&apos;re using. You don&apos;t have to tell them.
        </p>
      </div>
    </div>
  );
}
