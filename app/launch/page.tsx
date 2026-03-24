"use client";

import { type NextPage } from "next";
import { useState } from "react";
import { LaunchForm } from "@/components/Launch/LaunchForm";
import { CampaignResults } from "@/components/Launch/CampaignResults";
import { useLaunchCampaign, type LaunchFormData } from "@/hooks/useLaunchCampaign";

const LaunchPage: NextPage = () => {
  const { sections, isGenerating, isDone, error, generate, reset, progress } = useLaunchCampaign();
  const [formData, setFormData] = useState<LaunchFormData | null>(null);
  const showResults = isGenerating || isDone;

  const handleSubmit = (data: LaunchFormData) => {
    setFormData(data);
    generate(data);
  };

  const handleReset = () => {
    setFormData(null);
    reset();
  };

  return (
    <div className="max-w-screen min-h-screen p-4 pb-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-3">
          Release Autopilot
        </h1>
        <p className="text-lg text-muted-foreground text-left font-light font-sans max-w-2xl">
          Generate your entire music release campaign in under 60 seconds — press release, Spotify
          pitch, social captions, TikTok hooks, fan newsletter, and curator email.
        </p>
        {!showResults && (
          <p className="text-sm text-muted-foreground mt-2 font-sans">
            What a PR firm charges{" "}
            <span className="line-through">$3,000</span>
            {" "}— free.
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
          {error}
        </div>
      )}

      {!showResults ? (
        <div className="max-w-2xl">
          <LaunchForm onSubmit={handleSubmit} isLoading={isGenerating} />
        </div>
      ) : (
        <CampaignResults
          sections={sections}
          progress={progress}
          isGenerating={isGenerating}
          isDone={isDone}
          onReset={handleReset}
          artistName={formData?.artist_name ?? ""}
          songName={formData?.song_name ?? ""}
        />
      )}
    </div>
  );
};

export default LaunchPage;
