import { RetrieveVideoContentResult } from "@/components/VercelChat/types";
import { Video } from "lucide-react";
import { useState } from "react";
import MessageMediaDownloadButton from "@/components/VercelChat/MessageMediaDownloadButton";
import { useMediaDownloader } from "@/hooks/useMediaDownloader";

interface Sora2VideoResultProps {
  result: RetrieveVideoContentResult;
}

export function Sora2VideoResult({ result }: Sora2VideoResultProps) {
  const [videoError, setVideoError] = useState<string | null>(null);
  const { isDownloading, handleDownload } = useMediaDownloader({
    url: result.videoUrl ?? null,
    filename: `sora-video-${result.video_id}.mp4`,
  });

  if (!result.success) {
    return (
      <div className="flex flex-col gap-2 py-2 text-sm text-destructive">
        <p>{result.error || "Failed to retrieve video"}</p>
      </div>
    );
  }

  const handleVideoError = () => {
    setVideoError(
      "Failed to load video. Please try refreshing or downloading the file.",
    );
  };

  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <Video className="h-4 w-4 text-primary" />
        <span className="font-medium">Video Generated</span>
        <span className="text-muted-foreground">• {result.sizeInMB}</span>
      </div>

      {result.videoUrl ? (
        <>
          {videoError ? (
            <div className="w-full max-w-2xl rounded-lg border shadow-sm bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">{videoError}</p>
            </div>
          ) : (
            <video
              controls
              className="w-full max-w-2xl rounded-lg border shadow-sm"
              src={result.videoUrl}
              onError={handleVideoError}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          )}
          <MessageMediaDownloadButton
            label="Download Video"
            onClick={handleDownload}
            isDownloading={isDownloading}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{result.message}</p>
      )}
    </div>
  );
}
