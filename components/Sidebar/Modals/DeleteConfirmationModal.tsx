import { useState, useEffect } from "react";
import Modal from "@/components/Modal";
import type { Conversation } from "@/types/Chat";
import type { ArtistAgent } from "@/lib/supabase/getArtistAgents";
import { useDeleteChat } from "@/hooks/useDeleteChat";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatRoom: Conversation | ArtistAgent | null;
  chatRooms?: Array<Conversation | ArtistAgent>;
  onDelete: () => void;
}

// Helper functions for type handling and data extraction
const isChatRoom = (item: Conversation | ArtistAgent): item is Conversation => 'id' in item;
const getChatName = (item: Conversation | ArtistAgent): string => isChatRoom(item) ? item.topic : item.type;
const getChatId = (item: Conversation | ArtistAgent): string => isChatRoom(item) ? item.id : item.agentId;

const DeleteConfirmationModal = ({ isOpen, onClose, chatRoom, chatRooms, onDelete }: DeleteConfirmationModalProps) => {
  const [error, setError] = useState("");
  const [deletingProgress, setDeletingProgress] = useState<{ current: number; total: number } | null>(null);
  const { deleteChat, isDeleting } = useDeleteChat();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setError("");
        setDeletingProgress(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Determine if this is bulk delete or single delete
  const isBulkDelete = chatRooms && chatRooms.length > 0;
  const chatsToDelete = isBulkDelete ? chatRooms : (chatRoom ? [chatRoom] : []);

  if (!isOpen || chatsToDelete.length === 0) return null;

  const chatCount = chatsToDelete.length;
  const isSingleDelete = chatCount === 1;
  const chatName = isSingleDelete ? getChatName(chatsToDelete[0]) : `${chatCount} chats`;
  const buttonText = isDeleting
    ? (deletingProgress ? `Deleting ${deletingProgress.current}/${deletingProgress.total}...` : 'Deleting...')
    : 'Delete';

  const handleDelete = async () => {
    setError("");
    setDeletingProgress({ current: 0, total: chatCount });

    try {
      const failedChats: string[] = [];

      for (let i = 0; i < chatsToDelete.length; i++) {
        const chat = chatsToDelete[i];
        setDeletingProgress({ current: i + 1, total: chatCount });

        try {
          await deleteChat(getChatId(chat));
        } catch (chatError) {
          console.error(`Error deleting chat ${getChatName(chat)}:`, chatError);
          failedChats.push(getChatName(chat));
        }
      }

      if (failedChats.length > 0) {
        setError(`Failed to delete: ${failedChats.join(', ')}`);
        setDeletingProgress(null);
        await onDelete();
        return;
      }

      await onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting chats:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete chats. Please try again.');
      setDeletingProgress(null);
    }
  };

  const handleModalClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <Modal onClose={handleModalClose}>
      <div className="p-4 relative">
        <h2 className="text-xl font-semibold mb-4">
          {isSingleDelete ? 'Delete Chat' : 'Delete Chats'}
        </h2>
        <p className="mb-5 text-base">
          Are you sure you want to delete {isSingleDelete ? `"${chatName}"` : chatName}? This action cannot be undone.
        </p>

        {error && (
          <div className="mb-5 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-5 py-2.5 text-base border border-border rounded-lg transition-colors duration-200 hover:bg-muted min-w-[100px] flex items-center justify-center"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-5 py-2.5 text-base bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-all duration-200 min-w-[100px] flex items-center justify-center font-medium"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && (
              <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            )}
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
