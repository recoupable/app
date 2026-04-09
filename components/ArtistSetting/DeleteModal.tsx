import { useArtistProvider } from "@/providers/ArtistProvider";
import { ArtistRecord } from "@/types/Artist";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "sonner";
import { deleteArtist } from "@/lib/artists/deleteArtist";

interface DeleteModalProps {
  toggleModal: () => void;
}

const DeleteModal = ({ toggleModal }: DeleteModalProps) => {
  const { editableArtist, artists, setArtists, toggleSettingModal, getArtists } =
    useArtistProvider();
  const { getAccessToken } = usePrivy();

  const handleDelete = async () => {
    const artistId = editableArtist?.account_id;
    if (!artistId) {
      return;
    }

    const previousArtists = artists;
    const temp = artists.filter(
      (artistEle: ArtistRecord) =>
        artistEle.account_id !== artistId,
    );
    setArtists([...temp]);
    toggleModal();
    toggleSettingModal();

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to delete an artist");
      }

      await deleteArtist(accessToken, artistId);
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
    <div className="fixed left-0 top-0 w-screen h-screen flex items-center justify-center backdrop-blur-[4px] bg-[#8080806b]">
      <div className="border border-[2px] px-6 py-2 rounded-lg bg-card">
        <p className="text-center mb-3">Are You Sure?</p>
        <div className="flex gap-3 items-center">
          <button
            className="rounded-lg px-10 py-2 border border-[2px] bg-black text-white"
            type="button"
            onClick={handleDelete}
          >
            Yes
          </button>
          <button
            className="rounded-lg px-10 py-2 border border-[2px] text-grey-700"
            onClick={toggleModal}
            type="button"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
