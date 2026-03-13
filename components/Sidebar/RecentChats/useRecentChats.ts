import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import useClickChat from "@/hooks/useClickChat";
import { useConversationsProvider } from "@/providers/ConversationsProvider";
import { useMobileDetection } from "@/hooks/useMobileDetection";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import type { Conversation } from "@/types/Chat";
import type { ArtistAgent } from "@/lib/supabase/getArtistAgents";
import { getChatRoomId } from "@/lib/chat/getChatRoomId";

interface UseRecentChatsParams {
  toggleModal: () => void;
}

export const useRecentChats = ({ toggleModal }: UseRecentChatsParams) => {
  const { conversations, isLoading, isFetching, refetchConversations } = useConversationsProvider();
  const { handleClick } = useClickChat();
  const isMobile = useMobileDetection();
  const params = useParams();

  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(
    typeof params?.roomId === "string"
      ? params.roomId
      : typeof params?.agentId === "string"
        ? params.agentId
        : null,
  );

  useEffect(() => {
    const updateActiveChatId = () => {
      const urlChatId = window.location.pathname.match(/\/chat\/([^\/]+)/);

      if (urlChatId && urlChatId[1]) {
        setActiveChatId(urlChatId[1]);
        return;
      }

      const roomId = typeof params?.roomId === "string" ? params.roomId : null;
      const agentId = typeof params?.agentId === "string" ? params.agentId : null;
      setActiveChatId(roomId || agentId || null);
    };

    updateActiveChatId();
  }, [params, conversations]);

  const [modalState, setModalState] = useState<{
    type: "rename" | "delete" | null;
    chatRoom: Conversation | ArtistAgent | null;
    chatRooms?: Array<Conversation | ArtistAgent>;
  }>({ type: null, chatRoom: null });

  const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useOutsideClick({
    menuRef,
    buttonRefs,
    isOpen: !!openMenuId,
    onClose: () => setOpenMenuId(null),
  });

  const openModal = (type: "rename" | "delete", chatRoom: Conversation | ArtistAgent) => {
    setModalState({ type, chatRoom });
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setModalState({ type: null, chatRoom: null });
    setSelectedChatIds(new Set());
  };

  const handleApiAction = async () => {
    try {
      await refetchConversations();
      setSelectedChatIds(new Set());
    } catch (error) {
      console.error(`Error refreshing conversations after ${modalState.type}:`, error);
    }
  };

  const handleChatSelection = (chatId: string, isShiftKey: boolean) => {
    setSelectedChatIds(prev => {
      const newSelection = new Set(prev);

      if (isShiftKey && lastClickedId) {
        const chatIds = conversations.map(getChatRoomId);
        const lastIndex = chatIds.indexOf(lastClickedId);
        const currentIndex = chatIds.indexOf(chatId);

        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);

          for (let i = start; i <= end; i++) {
            newSelection.add(chatIds[i]);
          }
        }
      } else if (newSelection.has(chatId)) {
        newSelection.delete(chatId);
      } else {
        newSelection.add(chatId);
      }

      return newSelection;
    });

    setLastClickedId(chatId);
  };

  const handleBulkDelete = () => {
    const chatsToDelete = conversations.filter(chat => selectedChatIds.has(getChatRoomId(chat)));

    if (chatsToDelete.length === 0) {
      return;
    }

    setModalState({
      type: "delete",
      chatRoom: null,
      chatRooms: chatsToDelete,
    });
    setOpenMenuId(null);
  };

  const clearSelection = () => setSelectedChatIds(new Set());

  const handleChatClick = (chatRoom: Conversation | ArtistAgent) => {
    handleClick(chatRoom, toggleModal);
  };

  const toggleMenu = (roomId: string) => {
    setOpenMenuId(current => (current === roomId ? null : roomId));
  };

  const isSelectionMode = selectedChatIds.size > 0;
  const isRenameModalOpen = modalState.type === "rename";
  const isDeleteModalOpen = modalState.type === "delete";

  return {
    conversations,
    isLoading,
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
    isFetching,
  };
};
