import Image from "next/image";
import { ImageGenerationResult } from "@/components/VercelChat/types";
import { useImageDownloader } from "@/hooks/useImageDownloader";
import MessageMediaDownloadButton from "@/components/VercelChat/MessageMediaDownloadButton";
import ToolError from "../shared/ToolError";

interface ImageResultProps {
  result: ImageGenerationResult;
}

export function ImageResult({ result }: ImageResultProps) {
  const { imageUrl } = result;

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

          <div className="h-auto w-full max-w-md max-h-md">
            <Image
              src={imageUrl}
              alt="AI-generated image"
              width={448}
              height={448}
              style={{
                width: "100%",
                height: "auto",
                maxWidth: "28rem",
                maxHeight: "28rem",
                objectFit: "contain",
              }}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageResult;
