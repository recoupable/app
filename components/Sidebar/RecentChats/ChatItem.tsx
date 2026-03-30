import { useState, useEffect, type RefObject, type MouseEvent } from "react";
import { MoreHorizontal, Pencil, Trash2, Check } from "lucide-react";
import type { Conversation } from "@/types/Chat";
import type { ArtistAgent } from "@/lib/supabase/getArtistAgents";
import { cn } from "@/lib/utils";
import useCreateChat from "@/hooks/useCreateChat";
import { getChatDisplayInfo } from "@/lib/chat/getChatDisplayInfo";

type ChatItemProps = {
  chatRoom: Conversation | ArtistAgent;
  isMobile: boolean;
  isHovered: boolean;
  isMenuOpen: boolean;
  isActive?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  isShiftPressed?: boolean;
  menuRef: RefObject<HTMLDivElement> | null;
  setButtonRef: (el: HTMLButtonElement | null) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onChatClick: () => void;
  onSelect: (isShiftKey: boolean) => void;
  onMenuToggle: () => void;
  onRenameClick: () => void;
  onDeleteClick: () => void;
};

const ChatItem = ({
  chatRoom,
  isMobile,
  isHovered,
  isMenuOpen,
  isActive = false,
  isSelected = false,
  isSelectionMode = false,
  menuRef,
  setButtonRef,
  onMouseEnter,
  onMouseLeave,
  onChatClick,
  onSelect,
  onMenuToggle,
  onRenameClick,
  onDeleteClick,
}: ChatItemProps) => {
  const [displayName, setDisplayName] = useState(
    getChatDisplayInfo(chatRoom).displayName
  );

  useEffect(() => {
    setDisplayName(getChatDisplayInfo(chatRoom).displayName);
  }, [chatRoom]);

  const showOptions = isMobile || isHovered || isActive;
  const isOptimisticChatItem =
    "id" in chatRoom &&
    Array.isArray((chatRoom as Conversation).memories) &&
    (chatRoom as Conversation).memories.some((memory) => {
      const content = memory?.content as unknown;
      if (!content || typeof content !== "object") {
        return false;
      }

      return (
        "optimistic" in (content as Record<string, unknown>) &&
        (content as { optimistic?: unknown }).optimistic === true
      );
    });

  useCreateChat({
    isOptimisticChatItem,
    chatRoom,
    setDisplayName,
  });

  const handleClick = (event: MouseEvent) => {
    if (event.shiftKey || isSelectionMode) {
      onSelect(event.shiftKey);
      return;
    }
    onChatClick();
  };

  const displayText =
    typeof displayName === "string" && displayName.trim().length > 0
      ? displayName
      : "Untitled Chat";

  return (
    <div
      className={`flex gap-1.5 items-center w-full py-[6px] px-3 rounded-lg transition-all duration-150 relative ${
        isSelected
          ? "bg-primary/20 dark:bg-primary/30 border border-primary/30 dark:border-primary/40"
          : isActive
            ? "bg-primary/10 "
            : "hover:bg-muted dark:hover:bg-dark-bg-tertiary"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isSelectionMode && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect(event.shiftKey);
          }}
          className={cn(
            "shrink-0 w-4 h-4 rounded border-2 transition-all duration-150 flex items-center justify-center",
            isSelected
              ? "bg-primary border-primary"
              : "border-border hover:border-primary/50"
          )}
          aria-label="Select chat"
        >
          {isSelected && (
            <Check size={12} className="text-white" strokeWidth={3} />
          )}
        </button>
      )}

      <button
        className="flex-grow text-left truncate min-w-0"
        type="button"
        onClick={handleClick}
      >
        <p className={`text-sm truncate dark:text-muted-foreground ${isActive ? "font-medium" : ""}`}>
          {displayText}
        </p>
      </button>

      {!isSelectionMode && (
        <button
          ref={setButtonRef}
          className={cn(
            `shrink-0 p-1 text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground transition-colors duration-150 ${
              showOptions ? "opacity-100" : "opacity-0"
            }`,
            {
              "opacity-50 pointer-events-none": isOptimisticChatItem,
            }
          )}
          onClick={(event) => {
            event.stopPropagation();
            onMenuToggle();
          }}
          type="button"
          aria-label="Chat options"
        >
          <MoreHorizontal size={16} />
        </button>
      )}

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-2 top-full mt-1 bg-card shadow-lg rounded-md py-1 z-10 w-32 border border-border "
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              onMenuToggle();
            }
          }}
          tabIndex={-1}
          role="menu"
        >
          <button
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-muted dark:hover:bg-dark-bg-tertiary text-sm dark:text-muted-foreground flex items-center gap-2 transition-colors"
            onClick={onRenameClick}
            role="menuitem"
          >
            <Pencil size={14} className="text-muted-foreground" />
            <span>Rename</span>
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm text-red-500 dark:text-red-400 flex items-center gap-2 transition-colors"
            onClick={onDeleteClick}
            role="menuitem"
          >
            <Trash2 size={14} className="text-red-500 dark:text-red-400" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatItem;
