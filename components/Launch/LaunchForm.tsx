"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { LaunchFormData } from "@/hooks/useLaunchCampaign";

interface LaunchFormProps {
  onSubmit: (data: LaunchFormData) => void;
  isLoading: boolean;
}

export function LaunchForm({ onSubmit, isLoading }: LaunchFormProps) {
  const [formData, setFormData] = useState<LaunchFormData>({
    artist_name: "",
    song_name: "",
    genre: "",
    release_date: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.artist_name || !formData.song_name || !formData.genre || !formData.release_date) {
      return;
    }
    onSubmit(formData);
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#345A5D]/40 transition-all";

  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Artist Name *</label>
          <input
            type="text"
            placeholder="e.g. Olivia Rodrigo"
            value={formData.artist_name}
            onChange={e => setFormData(d => ({ ...d, artist_name: e.target.value }))}
            className={inputClass}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className={labelClass}>Song / Album Name *</label>
          <input
            type="text"
            placeholder="e.g. Midnight Drive"
            value={formData.song_name}
            onChange={e => setFormData(d => ({ ...d, song_name: e.target.value }))}
            className={inputClass}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className={labelClass}>Genre *</label>
          <input
            type="text"
            placeholder="e.g. Indie Pop, R&B, Hip-Hop"
            value={formData.genre}
            onChange={e => setFormData(d => ({ ...d, genre: e.target.value }))}
            className={inputClass}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className={labelClass}>Release Date *</label>
          <input
            type="text"
            placeholder="e.g. April 15, 2026"
            value={formData.release_date}
            onChange={e => setFormData(d => ({ ...d, release_date: e.target.value }))}
            className={inputClass}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Additional Context{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          placeholder="e.g. This song is about overcoming heartbreak, written after a 2-year relationship. Inspired by Bon Iver and Frank Ocean."
          value={formData.description}
          onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
          className={`${inputClass} h-24 resize-none`}
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        disabled={
          isLoading ||
          !formData.artist_name ||
          !formData.song_name ||
          !formData.genre ||
          !formData.release_date
        }
        className="w-full h-12 text-base font-semibold bg-[#345A5D] hover:bg-[#2a4a4d] text-white rounded-xl transition-all"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating Campaign...
          </span>
        ) : (
          "Generate My Campaign ✦"
        )}
      </Button>
    </form>
  );
}
