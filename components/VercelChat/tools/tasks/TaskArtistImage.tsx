import { Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useArtistImage from "@/hooks/useArtistImage";

interface TaskArtistImageProps {
  artistAccountId?: string | null;
}

const TaskArtistImage: React.FC<TaskArtistImageProps> = ({
  artistAccountId,
}) => {
  const { imageUrl, artistName } = useArtistImage(artistAccountId);
  const artistLabel = artistName?.trim() ? artistName : "Artist avatar";

  return (
    <Avatar className="items-center justify-center bg-muted">
      <AvatarImage
        src={imageUrl ?? undefined}
        alt={artistLabel}
        className="object-cover"
      />
      <AvatarFallback role="img" aria-label={artistLabel}>
        <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </AvatarFallback>
    </Avatar>
  );
};

export default TaskArtistImage;
