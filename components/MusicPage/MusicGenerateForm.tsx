"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import MusicFieldLabel from "./MusicFieldLabel";
import MusicAdditionalSettings, { MusicSettings } from "./MusicAdditionalSettings";
import { useCreateMusicGeneration } from "@/hooks/useCreateMusicGeneration";
import {
  MUSIC_DEFAULTS,
  MUSIC_HINTS,
  creditCostForDuration,
} from "@/lib/music/const";
import { formatCreditsAsUsd } from "@/lib/credits/formatCreditsAsUsd";

const EMPTY_SETTINGS: MusicSettings = {
  duration: MUSIC_DEFAULTS.duration,
  seed: "",
  numInferenceSteps: MUSIC_DEFAULTS.numInferenceSteps,
  guidanceScale: MUSIC_DEFAULTS.guidanceScale,
};

const MusicGenerateForm = () => {
  const [prompt, setPrompt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [settings, setSettings] = useState<MusicSettings>(EMPTY_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { generate, isPending } = useCreateMusicGeneration();

  const credits = creditCostForDuration(settings.duration);
  const canGenerate = prompt.trim().length > 0 && lyrics.trim().length > 0 && !isPending;

  const reset = () => {
    setPrompt("");
    setLyrics("");
    setSettings(EMPTY_SETTINGS);
  };

  const submit = () => {
    generate({
      prompt: prompt.trim(),
      lyrics: lyrics.trim(),
      duration: settings.duration,
      num_inference_steps: settings.numInferenceSteps,
      guidance_scale: settings.guidanceScale,
      // Blank means "choose one", which the API expresses by omission.
      ...(settings.seed ? { seed: Number(settings.seed) } : {}),
    });
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="rounded-lg border p-4 md:p-6 flex flex-col gap-4">
        <h2 className="font-heading text-sm font-semibold">New song</h2>

        <div className="flex flex-col gap-1.5">
          <MusicFieldLabel htmlFor="music-prompt" label="Prompt" hint={MUSIC_HINTS.prompt} />
          <Textarea
            id="music-prompt"
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
            placeholder="Genre: acoustic pop. BPM: 96. Key: C major. Warm and intimate, building gently into the chorus."
            className="min-h-[84px]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <MusicFieldLabel htmlFor="music-lyrics" label="Lyrics" hint={MUSIC_HINTS.lyrics} />
          <Textarea
            id="music-lyrics"
            value={lyrics}
            onChange={event => setLyrics(event.target.value)}
            placeholder={"[verse]\nMorning light filtering through the pine\n[chorus]\nSoftly the world begins to breathe"}
            className="min-h-[110px]"
          />
        </div>

        <MusicAdditionalSettings
          isOpen={isSettingsOpen}
          onToggle={() => setIsSettingsOpen(open => !open)}
          settings={settings}
          onChange={setSettings}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">
            Up to {formatCreditsAsUsd(credits)} for {settings.duration}s.
            You are charged for the audio actually generated.
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={reset} disabled={isPending} className="flex-1 sm:flex-none">
              Reset
            </Button>
            <Button onClick={submit} disabled={!canGenerate} className="flex-1 sm:flex-none">
              {isPending ? "Generating" : "Generate"}
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default MusicGenerateForm;
