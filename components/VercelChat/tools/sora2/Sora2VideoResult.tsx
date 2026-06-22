"use client";

import { RetrieveVideoContentResult } from "@/components/VercelChat/types";
import { Download, Video, Film, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ToolCard, ToolCardBody } from "../shared/ToolCard";
import { ToolError } from "../shared/ToolError";
import { ToolEmpty } from "../shared/ToolEmpty";

interface Sora2VideoResultProps {
  result: RetrieveVideoContentResult;
}

export function Sora2VideoResult({ result }: Sora2VideoResultProps) {
  const [videoError, setVideoError] = useState<string | null>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [started, setStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  const handlePlayOverlay = () => {
    setStarted(true);
    videoRef.current?.play().catch(() => {
      // Autoplay may be blocked; native controls remain available.
    });
  };

  if (!result.success) {
    return (
      <ToolError
        title="Video generation"
        message={result.error || "Failed to retrieve video"}
      />
    );
  }

  // Only treat the URL as safe for playback/download when it's an https URL or
  // a same-origin relative path — never a javascript:/data: scheme, and never a
  // protocol-relative URL ("//host/…") which would resolve to a foreign origin.
  const safeVideoUrl =
    typeof result.videoUrl === "string" &&
    (result.videoUrl.startsWith("https://") ||
      (result.videoUrl.startsWith("/") && !result.videoUrl.startsWith("//")))
      ? result.videoUrl
      : null;

  const handleDownload = () => {
    if (!safeVideoUrl) {
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = safeVideoUrl;
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
        safeVideoUrl ? (
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
        {safeVideoUrl ? (
          videoError ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">{videoError}</p>
            </div>
          ) : (
            <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black shadow-sm">
              <motion.video
                ref={videoRef}
                controls
                className="h-full w-full object-contain"
                src={safeVideoUrl}
                onError={handleVideoError}
                onCanPlay={() => setCanPlay(true)}
                preload="metadata"
                initial={false}
                animate={{ opacity: canPlay ? 1 : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                Your browser does not support the video tag.
              </motion.video>

              {/* Poster scrim + play affordance shown before the first play */}
              <AnimatePresence>
                {!started && (
                  <motion.button
                    type="button"
                    onClick={handlePlayOverlay}
                    aria-label="Play video"
                    className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-t from-black/40 via-transparent to-black/10"
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={reduceMotion ? undefined : { scale: 1.0 }}
                  >
                    <motion.span
                      className="flex size-14 items-center justify-center rounded-full bg-background/70 text-foreground shadow-lg backdrop-blur-sm transition-colors group-hover:bg-background/85"
                      initial={false}
                      animate={
                        reduceMotion || canPlay
                          ? { scale: 1 }
                          : { scale: [1, 1.08, 1] }
                      }
                      transition={{
                        duration: 1.8,
                        ease: "easeInOut",
                        repeat: canPlay ? 0 : Infinity,
                      }}
                    >
                      <Play className="size-6 translate-x-0.5" />
                    </motion.span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
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
