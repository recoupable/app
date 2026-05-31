import RecentChatSkeleton from "./RecentChatSkeleton";
import RenameModal from "../Modals/RenameModal";
import DeleteConfirmationModal from "../Modals/DeleteConfirmationModal";
import { useRecentChats } from "./useRecentChats";
import RecentChatList from "./RecentChatList";
import SelectionModeHeader from "./SelectionModeHeader";
import NoRecentChats from "./NoRecentChats";
import { useUserProvider } from "@/providers/UserProvder";

const RecentChats = ({ toggleModal }: { toggleModal: () => void }) => {
  const { userData } = useUserProvider();
  const {
    conversations,
    isLoading,
    isFetching,
    hoveredChatId,
    setHoveredChatId,
    openMenuId,
    toggleMenu,
    isMobile,
    activeChatId,
    selectedChatIds,
    isSelectionMode,
    menuRef,
    buttonRefs,
    isRenameModalOpen,
    isDeleteModalOpen,
    modalState,
    handleChatSelection,
    handleBulkDelete,
    handleChatClick,
    openModal,
    closeModal,
    clearSelection,
    handleApiAction,
    isShiftPressed,
  } = useRecentChats({ toggleModal });

  // Show the skeleton until both the artist context (`isLoading`, gated on
  // `useArtists`) and the first `/api/chats` fetch have settled. Without
  // the `isLoading` check the user briefly sees an empty list while the
  // query waits for the artist selection to resolve.
  const showSkeleton =
    !userData || isLoading || (isFetching && conversations.length === 0);

  return (
    <div className="w-full flex-grow min-h-0 flex flex-col">
      <div className="mt-3 mb-1 shrink-0">
        {isSelectionMode ? (
          <SelectionModeHeader
            selectedCount={selectedChatIds.size}
            onCancel={clearSelection}
            onDelete={handleBulkDelete}
          />
        ) : (
          <p className="text-xs text-muted-foreground px-3">Chats</p>
        )}
      </div>
      <div className="overflow-y-auto flex-grow">
        {showSkeleton ? (
          <RecentChatSkeleton />
        ) : (
          <>
            {conversations.length > 0 ? (
              <RecentChatList
                conversations={conversations}
                isMobile={isMobile}
                hoveredChatId={hoveredChatId}
                openMenuId={openMenuId}
                activeChatId={activeChatId}
                selectedChatIds={selectedChatIds}
                isSelectionMode={isSelectionMode}
                isShiftPressed={isShiftPressed}
                menuRef={menuRef}
                buttonRefs={buttonRefs}
                setHoveredChatId={setHoveredChatId}
                handleChatClick={handleChatClick}
                handleChatSelection={handleChatSelection}
                toggleMenu={toggleMenu}
                openModal={openModal}
              />
            ) : (
              <NoRecentChats />
            )}
          </>
        )}
      </div>

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={closeModal}
        chatRoom={modalState.chatRoom}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeModal}
        chatRoom={modalState.chatRoom}
        chatRooms={modalState.chatRooms}
        onDelete={handleApiAction}
      />
    </div>
  );
};

export default RecentChats;
