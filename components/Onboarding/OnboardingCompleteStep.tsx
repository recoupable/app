"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HIGHLIGHTS = [
  { icon: "🎯", title: "Fan segments mapped", desc: "Know exactly who's listening and where to grow." },
  { icon: "📅", title: "Release window insights", desc: "Best timing to drop based on your fans' activity." },
  { icon: "✅", title: "Proactive tasks queued", desc: "Your first week's to-do list — already written." },
  { icon: "💬", title: "AI artist chat ready", desc: "Ask anything about your artists. Get instant answers." },
];

interface Props {
  artistNames: string[];
  name: string | undefined;
  onComplete: () => void;
}

export function OnboardingCompleteStep({ artistNames, name, onComplete }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 text-center transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      {/* Celebration */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold tracking-tight">
          {name ? `${name}, you're all set.` : "You're all set."}
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          {artistNames.length > 0
            ? `Your intelligence files for ${artistNames.slice(0, 2).join(" and ")}${artistNames.length > 2 ? ` (+${artistNames.length - 2} more)` : ""} are ready.`
            : "Your Recoupable workspace is ready to go."}
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {HIGHLIGHTS.map((h, i) => (
          <div
            key={i}
            style={{ transitionDelay: `${i * 80}ms` }}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-xl border bg-muted/30 p-4 text-left transition-all duration-500",
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            )}
          >
            <span className="text-xl">{h.icon}</span>
            <p className="text-xs font-semibold">{h.title}</p>
            <p className="text-xs text-muted-foreground">{h.desc}</p>
          </div>
        ))}
      </div>

      <Button onClick={onComplete} className="w-full text-base py-5">
        Let&apos;s go 🚀
      </Button>

      <p className="text-xs text-muted-foreground">
        Your friends will ask how you got so ahead. Tell them.
      </p>
    </div>
  );
}
