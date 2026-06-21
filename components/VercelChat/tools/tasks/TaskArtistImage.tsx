import { useState } from "react";
import { Clock } from "lucide-react";
import useArtistImage from "@/hooks/useArtistImage";
import { cn } from "@/lib/utils";

interface TaskArtistImageProps {
  artistAccountId?: string | null;
}

const TaskArtistImage: React.FC<TaskArtistImageProps> = ({
  artistAccountId,
}) => {
  const { imageUrl, artistName } = useArtistImage(artistAccountId);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
      {imageUrl ? (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 animate-pulse bg-muted" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={artistName ?? "Artist avatar"}
            onLoad={() => setIsLoaded(true)}
            className={cn(
              "size-full object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      ) : (
        <Clock className="size-5 text-muted-foreground" />
      )}
    </div>
  );
};

export default TaskArtistImage;
