"use client";
import { useEffect, useId, useRef, useState } from "react";
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
  const descriptionId = useId();
  const [opened, setOpened] = useState(false);
  const [failed, setFailed] = useState(false);
  const media = useRef<HTMLMediaElement | null>(null);
  const url = resolveCreativeAsset(asset);
  useEffect(() => {
    const element = media.current;
    return () => {
      if (!element) return;
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
  }, [opened, url, failed]);
  if (!url || failed)
    return (
      <p role="status" className="text-sm leading-6">
        {asset.status === "expired"
          ? "Access expired. Your exact choice and notes are retained. This fixture cannot refresh account access; the host must supply renewed access for the same revision before you inspect it again."
          : asset.status === "processing"
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
          {asset.preview === "study-intro" ||
          asset.preview === "study-chorus" ? (
            <audio
              ref={media as React.RefObject<HTMLAudioElement>}
              controls
              preload="metadata"
              aria-label={asset.label}
              src={url}
              className="w-full"
              onCanPlay={onReady}
              onError={() => {
                setFailed(true);
                onFailure();
              }}
            >
              Your browser does not support audio playback.
            </audio>
          ) : asset.preview === "motion-square" ||
            asset.preview === "motion-circle" ? (
            <video
              ref={media as React.RefObject<HTMLVideoElement>}
              controls
              playsInline
              preload="metadata"
              aria-label={asset.label}
              aria-describedby={descriptionId}
              src={url}
              width={320}
              height={180}
              className="h-auto w-full"
              onCanPlay={onReady}
              onError={() => {
                setFailed(true);
                onFailure();
              }}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <ImageResult
              url={url}
              alt={asset.label}
              onLoad={onReady}
              onError={() => {
                setFailed(true);
                onFailure();
              }}
            />
          )}
          <figcaption
            id={descriptionId}
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
