"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useArtistProvider } from "@/providers/ArtistProvider";
import ArtistSkeleton from "./ArtistSkeleton";
import { Loader, Plus } from "lucide-react";
import useIsMobile from "@/hooks/useIsMobile";
import { useUserProvider } from "@/providers/UserProvder";
import { useSidebarExpansion } from "@/providers/SidebarExpansionContext";
import { cn } from "@/lib/utils";
import { useArtistPinRenderer } from "@/hooks/useArtistPinRenderer";
import CreateWorkspaceModal from "@/components/CreateWorkspaceModal";
import { useCreateWorkspaceModal } from "@/hooks/useCreateWorkspaceModal";

const ArtistsSidebar = () => {
  const {
    sorted,
    selectedArtist,
    isCreatingArtist,
    isLoading,
  } = useArtistProvider();
  const { email } = useUserProvider();
  const { setIsExpanded } = useSidebarExpansion();
  const isMobile = useIsMobile();
  const isArtistSelected = !!selectedArtist;
  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useCreateWorkspaceModal();

  const [menuExpanded, setMenuExpanded] = useState(false);
  const { renderArtistListWithPins } = useArtistPinRenderer({ sorted, menuExpanded });
  const animate = { width: menuExpanded ? 220 : 80 };
  const initial = { width: 80 };

  // Update the shared context when the local state changes
  useEffect(() => {
    setIsExpanded(menuExpanded);
  }, [menuExpanded, setIsExpanded]);

  const renderArtistList = () => {
    if (isLoading) {
      // Render skeleton items when loading
      return Array.from({ length: 8 }, (_, index) => (
        <ArtistSkeleton 
          key={`skeleton-${index}`}
          isMini={!menuExpanded}
          index={index}
        />
      ));
    }

    if (!email || !sorted.length) return null;

    return renderArtistListWithPins();
  };

  return (
    <motion.div
      className={`bg-sidebar px-3 py-7 hidden md:flex flex-col gap-2 z-[65] ${menuExpanded ? "items-stretch" : "items-center"} ${!isArtistSelected ? "relative" : ""}`}
      animate={animate}
      initial={initial}
      transition={{ duration: 0.2 }}
      onMouseOver={() => setMenuExpanded(!isMobile)}
      onMouseOut={() => setMenuExpanded(false)}
    >
      <div
        className={`no-scrollbar grow flex flex-col overflow-y-auto overflow-x-hidden ${menuExpanded ? "w-full" : "items-center"}`}
      >
        {renderArtistList()}
      </div>
      <button
        className={cn(
          "flex transition-colors hover:bg-accent dark:hover:bg-[#2a2a2a] border border-transparent hover:border-grey-dark-1 dark:hover:border-[#444] rounded-md",
          menuExpanded ? "px-2 py-1 gap-2 text-sm items-center text-grey-dark-1 dark:text-muted-foreground" : "justify-center p-2",
          !isArtistSelected && "relative z-70 brightness-125"
        )}
        type="button"
        onClick={openModal}
        disabled={isCreatingArtist}
      >
        <div className="flex justify-center">
          {isCreatingArtist ? (
            <Loader className="size-5 text-grey-dark-1 dark:text-muted-foreground animate-spin" />
          ) : (
            <Plus className="size-5 text-grey-dark-1 dark:text-muted-foreground" />
          )}
        </div>
        {menuExpanded && <span>New Workspace</span>}
      </button>
      
      <CreateWorkspaceModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </motion.div>
  );
};

export default ArtistsSidebar;
