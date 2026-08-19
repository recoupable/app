import { useArtistProvider } from "@/providers/ArtistProvider";
import ValuationRunStatusChip from "@/components/Valuation/ValuationRunStatusChip";
import Artist from "./Artist";
import CreateWorkspaceModal from "@/components/CreateWorkspaceModal";
import { useCreateWorkspaceModal } from "@/hooks/useCreateWorkspaceModal";

const Artists = () => {
  const { artists, toggleCreation, menuVisibleArtistId } = useArtistProvider();
  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useCreateWorkspaceModal();

  return (
    <div className="grow h-[calc(100vh-64px)] md:h-screen overflow-hidden md:bg-grey-light-3 md:p-4">
      <div className="size-full bg-card rounded-xl flex flex-col items-center md:items-start gap-3 pt-6 md:pt-10 md:pb-4 px-4 md:px-20">
        <div className="flex items-center gap-3">
          <p className="font-sans font-medium text-[50px]">Artists</p>
          <ValuationRunStatusChip />
        </div>
        <p className="text-[19px] md:text-[25px] text-grey-dark text-center md:text-left">
          Choose an artist to dive into their insights and data.
        </p>
        <div className="mt-8 pb-4 space-y-4 md:space-y-0 md:flex md:flex-row gap-8 md:flex-wrap grow overflow-y-auto">
          {artists.map((artist) => (
            <Artist
              artist={artist}
              key={artist.id}
              isVisibleDropDown={artist.id === menuVisibleArtistId}
            />
          ))}
          <button
            type="button"
            className="w-[335px] !h-[162px] overflow-hidden rounded-xl relative border-grey border text-grey-dark text-xl"
            onClick={toggleCreation}
          >
            Add New Artist
          </button>
        </div>
        <button
          type="button"
          className="pb-4 text-sm text-grey-dark underline underline-offset-4 hover:text-foreground"
          onClick={openModal}
          aria-label="Create a new workspace"
        >
          New workspace
        </button>
      </div>
      <CreateWorkspaceModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default Artists;
