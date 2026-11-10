"use client";
import { useState } from "react";
import { ImageResult } from "@/components/VercelChat/tools/agent/media/ImageResult";
import type { CreativeAsset } from "@/lib/intelligent-ui/playground/creative/types";
import { resolveCreativeAsset } from "@/lib/intelligent-ui/playground/creative/resolveCreativeAsset";

export default function CreativeAssetPreview({
  asset,
  onReady,
  onFailure,
}: {
  asset: CreativeAsset;
  onReady: () => void;
  onFailure: () => void;
}) {
  const [opened, setOpened] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = resolveCreativeAsset(asset);
  if (!url || failed)
    return (
      <p role="status" className="text-sm leading-6">
        {asset.status === "processing"
          ? "Processing fixture — no completed preview is available. Choose an available variant."
          : asset.status === "withdrawn"
            ? "Withdrawn fixture — this revision cannot be selected. Choose an available variant."
            : "Preview unavailable. Choose an available variant or reopen this example to check the supplied revision again."}
      </p>
    );
  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-expanded={opened}
        className="min-h-11 rounded-lg border border-border px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => setOpened(true)}
      >
        Inspect {asset.label}
      </button>
      {opened && (
        <figure
          className={
            asset.preview === "dark-wordmark"
              ? "rounded-xl bg-[#132B26] p-4"
              : "rounded-xl bg-white p-4"
          }
        >
          <ImageResult
            url={url}
            alt={asset.label}
            onLoad={onReady}
            onError={() => {
              setFailed(true);
              onFailure();
            }}
          />
          <figcaption
            className={
              asset.preview === "dark-wordmark"
                ? "mt-3 text-sm text-white"
                : "mt-3 text-sm text-[#152E37]"
            }
          >
            {asset.caption}
          </figcaption>
        </figure>
      )}
    </div>
  );
}
