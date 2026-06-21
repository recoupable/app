"use client";

import { RetrieveVideoContentResult } from "@/components/VercelChat/types";
import { Download, Video, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";
import { ToolError } from "../shared/ToolError";
import { ToolEmpty } from "../shared/ToolEmpty";

interface Sora2VideoResultProps {
  result: RetrieveVideoContentResult;
}

export function Sora2VideoResult({ result }: Sora2VideoResultProps) {
  const [videoError, setVideoError] = useState<string | null>(null);

  if (!result.success) {
    return (
      <ToolError
        title="Video generation"
        message={result.error || "Failed to retrieve video"}
      />
    );
  }

  const handleDownload = () => {
    if (!result.videoUrl) {
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = result.videoUrl;
      link.download = `sora-video-${result.video_id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Swallow — the browser will surface its own download failure UI.
    }
  };

  const handleVideoError = () => {
    setVideoError(
      "Failed to load video. Please try refreshing or downloading the file.",
    );
  };

  return (
    <ToolCard
      icon={Video}
      tone="accent"
      title="Video generated"
      subtitle={result.sizeInMB ? `${result.sizeInMB} • Sora 2` : "Sora 2"}
      trailing={
        result.videoUrl ? (
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg px-2.5 text-xs"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        ) : null
      }
    >
      <ToolCardBody>
        {result.videoUrl ? (
          videoError ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">{videoError}</p>
            </div>
          ) : (
            <video
              controls
              className="aspect-video w-full rounded-xl border border-border bg-black object-contain shadow-sm"
              src={result.videoUrl}
              onError={handleVideoError}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          )
        ) : (
          <ToolEmpty
            icon={Film}
            title="No video to preview"
            description={result.message || "The video content is unavailable."}
          />
        )}
      </ToolCardBody>
    </ToolCard>
  );
}

export default Sora2VideoResult;
