import { useArtistProvider } from "@/providers/ArtistProvider";
import { ArtistRecord } from "@/types/Artist";
import { Trash2 } from "lucide-react";
import { containerPatterns, textPatterns } from "@/lib/styles/patterns";
import { cn } from "@/lib/utils";
import useDeleteArtist from "@/hooks/useDeleteArtist";

const DropDown = ({ artist }: { artist: ArtistRecord }) => {
  const { setMenuVisibleArtistId } = useArtistProvider();
  const { deleteArtist } = useDeleteArtist();

  const handleDelete = async () => {
    await deleteArtist(artist.account_id, {
      onSuccess: () => setMenuVisibleArtistId(null),
    });
  };

  return (
    <div className={cn(containerPatterns.dropdown, "absolute left-1/2 top-1/2 z-[2] p-1")}>
      <button
        className={cn(textPatterns.error, "flex items-center gap-1 text-sm hover:bg-destructive/10 px-2 py-1 rounded-md transition-colors")}
        onClick={handleDelete}
      >
        <Trash2 className="size-4" /> Remove
      </button>
    </div>
  );
};

export default DropDown;
