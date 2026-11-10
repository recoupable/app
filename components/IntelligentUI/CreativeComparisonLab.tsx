"use client";
import { useState } from "react";
import { creativeFixtures } from "@/lib/intelligent-ui/playground/creative/creativeFixtures";
import type { CreativeAsset } from "@/lib/intelligent-ui/playground/creative/types";
import { isChatIntelligentUIEnabled } from "@/lib/intelligent-ui/chat/isChatIntelligentUIEnabled";
import CreativeComparison from "./CreativeComparison";

export default function CreativeComparisonLab() {
  const [status, setStatus] = useState<CreativeAsset["status"]>("available");
  const scope = "owned-wordmark-comparison";
  if (!isChatIntelligentUIEnabled()) return null;
  return (
    <section id="conversation" className="space-y-6">
      <h1 className="text-xl font-medium">
        Compare two existing wordmark treatments
      </h1>
      <p className="text-sm leading-6">
        Owned Recoup assets at exact byte revisions. These are alternate
        background treatments, not successive edits. This local exercise does
        not represent an artist proposal or a production decision.
      </p>
      <details>
        <summary className="min-h-11 cursor-pointer py-3 text-sm">
          Synthetic access and processing states
        </summary>
        <label className="flex flex-wrap items-center gap-3 text-sm">
          Dark-background variant
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
        assets={creativeFixtures.map((asset, index) =>
          index === 1 ? { ...asset, status } : asset,
        )}
      />
    </section>
  );
}
