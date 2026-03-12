"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useUserProvider } from "@/providers/UserProvder";

const RESEARCH_LINES = [
  "Mapping your industry footprint…",
  "Scanning music business context…",
  "Preparing your personalized workspace…",
  "Queueing your first artist research tasks…",
  "Almost ready to blow your mind…",
];

interface Props {
  onDone: () => void;
}

/**
 * Animated "we're researching you" welcome screen.
 * Plays for ~2.5s then advances automatically.
 */
export function OnboardingWelcomeStep({ onDone }: Props) {
  const { email, userData } = useUserProvider();
  const [lineIdx, setLineIdx] = useState(0);
  const [done, setDone] = useState(false);

  const displayName =
    userData?.name || (email ? email.split("@")[0] : null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIdx(prev => {
        const next = prev + 1;
        if (next >= RESEARCH_LINES.length) {
          clearInterval(interval);
          setDone(true);
          setTimeout(onDone, 600);
          return prev;
        }
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center gap-8 py-6 text-center">
      {/* Pulsing orb */}
      <div className="relative flex items-center justify-center h-24 w-24">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/15" />
        <div className="absolute inset-2 animate-pulse rounded-full bg-primary/25" />
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl shadow-xl">
          🎵
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          {displayName
            ? `Hey ${displayName} — welcome to Recoupable.`
            : "Welcome to Recoupable."}
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          The AI platform built for people who actually move music.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        {RESEARCH_LINES.map((line, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-500",
              i < lineIdx
                ? "text-foreground"
                : i === lineIdx
                ? "text-foreground animate-pulse"
                : "text-muted-foreground/30",
            )}
          >
            <span>{i < lineIdx ? "✅" : i === lineIdx ? "⏳" : "○"}</span>
            {line}
          </div>
        ))}
      </div>

      {done && (
        <p className="text-xs text-primary font-medium animate-pulse">
          Let&apos;s go →
        </p>
      )}
    </div>
  );
}
