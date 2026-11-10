"use client";
import { useState } from "react";
import { audioFixtures } from "@/lib/intelligent-ui/playground/creative/audioFixtures";
import type { CreativeAsset } from "@/lib/intelligent-ui/playground/creative/types";
import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";
import CreativeComparison from "./CreativeComparison";

export default function AudioComparisonLab() {
  const [status, setStatus] = useState<CreativeAsset["status"]>("available");
  const scope = "original-section-study-comparison";
  if (!isChatIntelligentUIEnabled()) return null;
  return (
    <section id="conversation" className="space-y-6">
      <h1 className="text-xl font-medium">
        Compare two sections of an original audio study
      </h1>
      <p className="text-sm leading-6">
        Intro and chorus excerpts from one authored synthetic study, at exact
        byte revisions. No external recordings, samples or generation providers.
        These are different sections, not customer variants or
        production-quality evidence. Inspect to reveal native controls, then
        press Play to listen. Loading or playing does not choose or approve an
        excerpt.
      </p>
      <details>
        <summary className="min-h-11 cursor-pointer py-3 text-sm">
          Synthetic access and processing states
        </summary>
        <label className="flex flex-wrap items-center gap-3 text-sm">
          Chorus excerpt
          <select
            className="min-h-11 rounded-lg border border-border bg-background px-3"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as CreativeAsset["status"])
            }
          >
            {(
              ["available", "processing", "unavailable", "withdrawn"] as const
            ).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-xs">
          Local simulation only. This does not change a file or start a job.
        </p>
      </details>
      <CreativeComparison
        key={scope}
        scope={scope}
        assets={audioFixtures.map((asset, index) =>
          index === 1 ? { ...asset, status } : asset,
        )}
      />
    </section>
  );
}
