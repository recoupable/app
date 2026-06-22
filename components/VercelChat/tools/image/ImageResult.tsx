"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ImageGenerationResult } from "@/components/VercelChat/types";
import { useImageDownloader } from "@/hooks/useImageDownloader";
import MessageMediaDownloadButton from "@/components/VercelChat/MessageMediaDownloadButton";
import { ToolError } from "../shared/ToolError";

interface ImageResultProps {
  result: ImageGenerationResult;
}

export function ImageResult({ result }: ImageResultProps) {
  const { imageUrl } = result;
  const [loaded, setLoaded] = useState(false);
  const reduceMotion = useReducedMotion();

  const { isDownloading, isReady, handleDownload } = useImageDownloader({
    imageUrl,
    enabled: !!imageUrl,
  });

  if (!imageUrl) {
    return (
      <ToolError
        title="Image generation"
        message="The image couldn't be generated. Please try again with a different prompt."
      />
    );
  }

  return (
    <div className="flex justify-start my-3">
      <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="relative h-full w-full max-h-[28rem] max-w-md">
          {/* Top gradient overlay */}
          <div className="pointer-events-none absolute end-0 top-0 z-10 w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100 focus-within:opacity-100">
            <div className="h-20 w-full bg-gradient-to-t from-transparent to-black/30 md:rounded-t-2xl" />
          </div>

          {/* Bottom gradient overlay */}
          <div className="pointer-events-none absolute bottom-0 end-0 z-10 w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus:opacity-100 focus-within:opacity-100">
            <div className="h-20 w-full bg-gradient-to-b from-transparent to-black/30 md:rounded-b-2xl" />
          </div>

          {/* Download Image Button */}
          <MessageMediaDownloadButton
            onClick={handleDownload}
            overrideButtonClassName="hover:bg-white/10"
            overrideIconClassName="text-white"
            isReady={isReady}
            isDownloading={isDownloading}
          />

          {/* Developing-photo placeholder fades out as the image resolves */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-muted via-muted/60 to-muted transition-opacity duration-500 ${
              loaded ? "opacity-0" : "animate-pulse opacity-100"
            }`}
          />

          <div className="h-auto w-full max-w-md max-h-md">
            <motion.div
              initial={false}
              animate={
                reduceMotion
                  ? { opacity: loaded ? 1 : 0 }
                  : {
                      opacity: loaded ? 1 : 0,
                      scale: loaded ? 1 : 1.04,
                      filter: loaded ? "blur(0px)" : "blur(12px)",
                    }
              }
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={imageUrl}
                alt="AI-generated image"
                width={448}
                height={448}
                onLoad={() => setLoaded(true)}
                style={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "28rem",
                  maxHeight: "28rem",
                  objectFit: "contain",
                }}
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageResult;
