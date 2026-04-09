import { useArtistProvider } from "@/providers/ArtistProvider";
import { ArtistRecord } from "@/types/Artist";
import { Trash2 } from "lucide-react";
import { containerPatterns, textPatterns } from "@/lib/styles/patterns";
import { cn } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { deleteArtist } from "@/lib/artists/deleteArtist";

const DropDown = ({ artist }: { artist: ArtistRecord }) => {
  const { setArtists, artists, setMenuVisibleArtistId, getArtists } =
    useArtistProvider();
  const { getAccessToken } = usePrivy();

  const handleDelete = async () => {
    const previousArtists = artists;
    const temp = artists.filter(
      (artistEle: ArtistRecord) => artistEle.account_id !== artist.account_id,
    );
    setArtists([...temp]);
    setMenuVisibleArtistId(null);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to delete an artist");
      }

      await deleteArtist(accessToken, artist.account_id);
    } catch (error) {
      setArtists(previousArtists);
      toast.error(error instanceof Error ? error.message : "Failed to delete artist");
      return;
    }

    try {
      await getArtists();
    } catch {
      toast.error("Artist deleted, but failed to refresh the artist list");
    }
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
