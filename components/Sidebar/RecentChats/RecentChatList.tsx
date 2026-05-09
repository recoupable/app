import { AnimatePresence, motion } from "framer-motion";
import type { Conversation } from "@/types/Chat";
import ChatItem from "./ChatItem";
import type { MutableRefObject } from "react";
import { getChatRoomId } from "@/lib/chat/getChatRoomId";

interface RecentChatListProps {
  conversations: Conversation[];
  isMobile: boolean;
  hoveredChatId: string | null;
  openMenuId: string | null;
  activeChatId: string | null;
  selectedChatIds: Set<string>;
  isSelectionMode: boolean;
  isShiftPressed: boolean;
  menuRef: MutableRefObject<HTMLDivElement | null>;
  buttonRefs: MutableRefObject<Record<string, HTMLButtonElement | null>>;
  setHoveredChatId: (chatId: string | null) => void;
  handleChatClick: (chatRoom: Conversation) => void;
  handleChatSelection: (chatId: string, isShiftKey: boolean) => void;
  toggleMenu: (roomId: string) => void;
  openModal: (type: "rename" | "delete", chatRoom: Conversation) => void;
}

const RecentChatList = ({
  conversations,
  isMobile,
  hoveredChatId,
  openMenuId,
  activeChatId,
  selectedChatIds,
  isSelectionMode,
  isShiftPressed,
  menuRef,
  buttonRefs,
  setHoveredChatId,
  handleChatClick,
  handleChatSelection,
  toggleMenu,
  openModal,
}: RecentChatListProps) => {
  return (
    <AnimatePresence initial={false}>
      {conversations.map((chatRoom) => {
        const roomId = getChatRoomId(chatRoom);

        return (
          <motion.div
            key={roomId}
            layout="position"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 0.5,
            }}
          >
            <ChatItem
              chatRoom={chatRoom}
              isMobile={isMobile}
              isHovered={hoveredChatId === roomId}
              isMenuOpen={openMenuId === roomId}
              isActive={roomId === activeChatId}
              isSelected={selectedChatIds.has(roomId)}
              isSelectionMode={isSelectionMode}
              isShiftPressed={isShiftPressed}
              menuRef={openMenuId === roomId ? menuRef : null}
              setButtonRef={(element: HTMLButtonElement | null) => {
                buttonRefs.current[roomId] = element;
              }}
              onMouseEnter={() => setHoveredChatId(roomId)}
              onMouseLeave={() => setHoveredChatId(null)}
              onChatClick={() => handleChatClick(chatRoom)}
              onSelect={(isShiftKey) => handleChatSelection(roomId, isShiftKey)}
              onMenuToggle={() => {
                toggleMenu(roomId);
              }}
              onRenameClick={() => openModal("rename", chatRoom)}
              onDeleteClick={() => openModal("delete", chatRoom)}
            />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};

export default RecentChatList;
