"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ROLES = [
  { id: "artist_manager", label: "Artist Manager", icon: "🎯", description: "I manage one or more artists" },
  { id: "label", label: "Record Label", icon: "🏷️", description: "I run a label or imprint" },
  { id: "artist", label: "Artist", icon: "🎤", description: "I'm the artist" },
  { id: "publisher", label: "Publisher", icon: "📝", description: "I handle publishing & sync" },
  { id: "dsp", label: "DSP / Platform", icon: "📱", description: "I work at a streaming platform" },
  { id: "other", label: "Other", icon: "✨", description: "Something else entirely" },
];

interface Props {
  selected: string | undefined;
  onSelect: (role: string) => void;
  onNext: () => void;
}

export function OnboardingRoleStep({ selected, onSelect, onNext }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          What best describes you?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll personalize everything to your world.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ROLES.map(role => (
          <button
            key={role.id}
            type="button"
            onClick={() => onSelect(role.id)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all hover:border-primary hover:bg-primary/5",
              selected === role.id
                ? "border-primary bg-primary/10"
                : "border-border bg-muted/30",
            )}
          >
            <span className="text-2xl">{role.icon}</span>
            <span className="text-sm font-semibold">{role.label}</span>
            <span className="text-xs text-muted-foreground">{role.description}</span>
          </button>
        ))}
      </div>

      <Button
        onClick={onNext}
        disabled={!selected}
        className="w-full"
      >
        Continue →
      </Button>
    </div>
  );
}
