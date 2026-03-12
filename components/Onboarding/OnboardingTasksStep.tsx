"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { OnboardingNavButtons } from "./OnboardingNavButtons";

type RoleTaskMap = Record<string, { icon: string; title: string; desc: string }[]>;

const ROLE_TASKS: RoleTaskMap = {
  artist_manager: [
    { icon: "📊", title: "Fan segment deep dive", desc: "Identify top 3 growth markets for each artist" },
    { icon: "📅", title: "Release window analysis", desc: "Find the best drop timing based on streaming patterns" },
    { icon: "🤝", title: "Playlist pitch list", desc: "Build a targeted pitch list for the next release" },
    { icon: "📱", title: "Social content calendar", desc: "Generate a 2-week content plan per platform" },
  ],
  label: [
    { icon: "📈", title: "Roster performance report", desc: "Weekly streaming & social benchmarks across roster" },
    { icon: "💰", title: "Sync opportunity scan", desc: "Match catalog tracks to current placement briefs" },
    { icon: "🎯", title: "Market expansion analysis", desc: "Find untapped territories for priority artists" },
    { icon: "📋", title: "A&R brief generator", desc: "Auto-draft artist development briefs from data" },
  ],
  artist: [
    { icon: "🎵", title: "Release strategy builder", desc: "Plan your next drop from concept to launch" },
    { icon: "📊", title: "Audience growth playbook", desc: "Tailored strategy based on your current fanbase" },
    { icon: "💬", title: "Press outreach list", desc: "Curated list of blogs, editors, and tastemakers" },
    { icon: "📱", title: "Content idea generator", desc: "30 days of social content ideas from your catalog" },
  ],
  publisher: [
    { icon: "🔍", title: "Sync pitch tracker", desc: "Track placement opportunities by catalog title" },
    { icon: "📊", title: "Royalty performance scan", desc: "Flag underperforming assets for renegotiation" },
    { icon: "🤝", title: "Sub-publisher match", desc: "Find territory reps based on catalog genre profile" },
    { icon: "📝", title: "Admin review checklist", desc: "Audit registration completeness across catalog" },
  ],
  dsp: [
    { icon: "🎯", title: "Emerging artist radar", desc: "Surface breakout acts based on velocity signals" },
    { icon: "📊", title: "Genre trend report", desc: "Identify rising micro-genres ahead of the curve" },
    { icon: "🤝", title: "Label partnership brief", desc: "Pitch deck framework for priority label meetings" },
    { icon: "🔔", title: "Cultural moment tracker", desc: "Link playlisting opportunities to trending moments" },
  ],
  other: [
    { icon: "🗓️", title: "Weekly priorities briefing", desc: "AI-curated to-do list based on your artists" },
    { icon: "📊", title: "Artist performance snapshot", desc: "At-a-glance metrics across all your artists" },
    { icon: "💡", title: "Opportunity alerts", desc: "Notify you when an artist hits a key milestone" },
    { icon: "📝", title: "Smart notes assistant", desc: "Turn meeting notes into action items instantly" },
  ],
};

const DEFAULT_TASKS = ROLE_TASKS["artist_manager"];

interface Props {
  roleType: string | undefined;
  artistNames: string[];
  onNext: () => void;
  onBack: () => void;
}

/**
 * Shows auto-generated tasks tailored to the user's role + artists,
 * giving them an immediate preview of what Recoupable will do for them.
 */
export function OnboardingTasksStep({ roleType, artistNames, onNext, onBack }: Props) {
  const tasks = ROLE_TASKS[roleType ?? ""] ?? DEFAULT_TASKS;
  const [revealed, setRevealed] = useState<number[]>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setRevealed(prev => [...prev, i]);
      i++;
      if (i >= tasks.length) clearInterval(interval);
    }, 180);
    return () => clearInterval(interval);
  }, [tasks.length]);

  const displayArtist = artistNames[0] ?? "your artists";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Your first week, already planned
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Based on your role and{" "}
          <span className="font-medium text-foreground">{displayArtist}</span>,
          we&apos;ve queued these to run automatically.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {tasks.map((task, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-xl border bg-muted/20 p-4 transition-all duration-500",
              revealed.includes(i)
                ? "opacity-100 translate-y-0 border-border"
                : "opacity-0 translate-y-2 border-transparent",
            )}
          >
            <span className="text-xl mt-0.5">{task.icon}</span>
            <div>
              <p className="text-sm font-semibold">{task.title}</p>
              <p className="text-xs text-muted-foreground">{task.desc}</p>
            </div>
            <div className="ml-auto shrink-0">
              <span className="text-xs text-primary font-medium">Queued ✓</span>
            </div>
          </div>
        ))}
      </div>

      <OnboardingNavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel="See your dashboard →"
      />
    </div>
  );
}
