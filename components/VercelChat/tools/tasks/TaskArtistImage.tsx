import { useEffect, useState } from "react";
import { Music2 } from "lucide-react";
import useArtistImage from "@/hooks/useArtistImage";
import { cn } from "@/lib/utils";

interface TaskArtistImageProps {
  artistAccountId?: string | null;
}

// Deterministic tint from the name so fallbacks read as identity, not anonymity.
const FALLBACK_TINTS = [
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "bg-violet-500/15 text-violet-600 dark:text-violet-400",
];

const tintFor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return FALLBACK_TINTS[Math.abs(hash) % FALLBACK_TINTS.length];
};

const initialsFor = (name?: string | null): string | null => {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("");
};

const TaskArtistImage: React.FC<TaskArtistImageProps> = ({
  artistAccountId,
}) => {
  const { imageUrl, artistName } = useArtistImage(artistAccountId);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset transient load state so a later valid URL retries instead of staying
  // stuck on a previous error/loaded result.
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [imageUrl, artistAccountId]);

  const showImage = imageUrl && !hasError;
  const initials = initialsFor(artistName);
  const tint = tintFor(artistName ?? artistAccountId ?? "task");

  return (
    <div
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border/60",
        showImage ? "bg-muted" : tint,
      )}
    >
      {showImage ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={artistName ?? "Artist avatar"}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={cn(
              "size-full object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      ) : initials ? (
        <span className="text-xs font-semibold">{initials}</span>
      ) : (
        <Music2 className="size-5" />
      )}
    </div>
  );
};

export default TaskArtistImage;
