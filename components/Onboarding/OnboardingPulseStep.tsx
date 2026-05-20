"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { OnboardingNavButtons } from "./OnboardingNavButtons";

const PULSE_BENEFITS = [
  { icon: "📈", text: "Daily streaming performance summaries" },
  { icon: "🔔", text: "Alerts when an artist spikes on social" },
  { icon: "🎯", text: "Weekly priority actions for each artist" },
  { icon: "📬", text: "Delivered to your inbox every morning" },
];

interface Props {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Onboarding step to activate Pulse — daily AI briefings per artist.
 */
export function OnboardingPulseStep({ enabled, onToggle, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⚡</span>
          <h2 className="text-2xl font-bold tracking-tight">Turn on Pulse</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Pulse sends you an AI-generated daily briefing on each of your artists —
          so you always know what to do next before you even open the app.
        </p>
      </div>

      {/* Toggle card */}
      <div
        className={cn(
          "rounded-xl border-2 p-5 transition-all cursor-pointer",
          enabled
            ? "border-primary bg-primary/8"
            : "border-border bg-muted/20",
        )}
        onClick={() => onToggle(!enabled)}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-sm">Daily Artist Intelligence</p>
            <p className="text-xs text-muted-foreground">
              {enabled ? "Active — you'll get your first briefing tomorrow morning." : "Off — tap to activate."}
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={onToggle} onClick={e => e.stopPropagation()} />
        </div>
      </div>

      {/* Benefits list */}
      <div className="flex flex-col gap-2">
        {PULSE_BENEFITS.map((b, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 text-sm transition-all duration-300",
              enabled ? "text-foreground" : "text-muted-foreground/60",
            )}
          >
            <span>{b.icon}</span>
            <span>{b.text}</span>
          </div>
        ))}
      </div>

      <OnboardingNavButtons
        onBack={onBack}
        onNext={onNext}
        nextLabel={enabled ? "Pulse is on — continue →" : "Skip for now →"}
      />
    </div>
  );
}
