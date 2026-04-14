import { useArtistProvider } from "@/providers/ArtistProvider";
import useDeleteArtist from "@/hooks/useDeleteArtist";

interface DeleteModalProps {
  toggleModal: () => void;
}

const DeleteModal = ({ toggleModal }: DeleteModalProps) => {
  const { editableArtist, toggleSettingModal } = useArtistProvider();
  const { deleteArtist } = useDeleteArtist();

  const handleDelete = async () => {
    const artistId = editableArtist?.account_id;
    if (!artistId) {
      return;
    }
    toggleModal();
    toggleSettingModal();
    await deleteArtist(artistId);
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
