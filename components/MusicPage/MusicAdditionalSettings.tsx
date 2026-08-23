"use client";

import { ChevronDown, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import MusicFieldLabel from "./MusicFieldLabel";
import MusicSliderField from "./MusicSliderField";
import { MUSIC_DEFAULTS, MUSIC_HINTS, MUSIC_RANGES } from "@/lib/music/const";

export interface MusicSettings {
  duration: number;
  seed: string;
  numInferenceSteps: number;
  guidanceScale: number;
}

export interface MusicAdditionalSettingsProps {
  isOpen: boolean;
  onToggle: () => void;
  settings: MusicSettings;
  onChange: (settings: MusicSettings) => void;
}

const MusicAdditionalSettings = ({
  isOpen,
  onToggle,
  settings,
  onChange,
}: MusicAdditionalSettingsProps) => {
  const set = <K extends keyof MusicSettings>(key: K, value: MusicSettings[K]) =>
    onChange({ ...settings, [key]: value });

  return (
    <div className="border-t pt-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2"
      >
        <span className="text-sm font-medium">Additional Settings</span>
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
          {isOpen ? "Less" : "More"}
          <ChevronDown
            className={cn("size-4 transition-transform", isOpen && "rotate-180")}
          />
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <MusicSliderField
            id="music-duration"
            label="Duration"
            hint={MUSIC_HINTS.duration}
            {...MUSIC_RANGES.duration}
            value={settings.duration}
            defaultValue={MUSIC_DEFAULTS.duration}
            format={value => `${value}s`}
            onChange={value => set("duration", value)}
          />

          <div className="flex flex-col gap-2 min-w-0">
            <MusicFieldLabel htmlFor="music-seed" label="Seed" hint={MUSIC_HINTS.seed} />
            <div className="flex items-center gap-2">
              <Input
                id="music-seed"
                inputMode="numeric"
                placeholder="random"
                value={settings.seed}
                onChange={event =>
                  set("seed", event.target.value.replace(/[^0-9]/g, ""))
                }
                className="min-w-0"
              />
              <button
                type="button"
                aria-label="Randomize seed"
                onClick={() =>
                  set("seed", String(Math.floor(Math.random() * 2_147_483_647)))
                }
                className="shrink-0 inline-flex items-center justify-center size-9 rounded-xl border hover:bg-muted transition-colors"
              >
                <Shuffle className="size-4" />
              </button>
            </div>
          </div>

          <MusicSliderField
            id="music-steps"
            label="Num Inference Steps"
            hint={MUSIC_HINTS.numInferenceSteps}
            {...MUSIC_RANGES.numInferenceSteps}
            value={settings.numInferenceSteps}
            defaultValue={MUSIC_DEFAULTS.numInferenceSteps}
            onChange={value => set("numInferenceSteps", value)}
          />

          <MusicSliderField
            id="music-guidance"
            label="Guidance Scale"
            hint={MUSIC_HINTS.guidanceScale}
            {...MUSIC_RANGES.guidanceScale}
            value={settings.guidanceScale}
            defaultValue={MUSIC_DEFAULTS.guidanceScale}
            onChange={value => set("guidanceScale", value)}
          />
        </div>
      )}
    </div>
  );
};

export default MusicAdditionalSettings;
