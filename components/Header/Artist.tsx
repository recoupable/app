import { useArtistProvider } from "@/providers/ArtistProvider";
import { ArtistRecord } from "@/types/Artist";
import ImageWithFallback from "../ImageWithFallback";
import { EllipsisVertical, Pin, PinOff } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useArtistPinToggle } from "@/hooks/useArtistPinToggle";
import ArtistActionButton from "./ArtistActionButton";

const Artist = ({
  artist,
  toggleDropDown,
  isMini,
}: {
  artist: ArtistRecord | null;
  toggleDropDown: () => void;
  isMini?: boolean;
}) => {
  const {
    setSelectedArtist,
    selectedArtist,
    toggleUpdate,
    toggleSettingModal,
  } = useArtistProvider();
  const [isHovered, setIsHovered] = useState(false);
  const { togglePin, isPinning } = useArtistPinToggle(artist);

  const isSelectedArtist = selectedArtist?.account_id === artist?.account_id;
  const isAnyArtistSelected = !!selectedArtist;
  const shouldHighlight = !isAnyArtistSelected; // Highlight when no artist is selected

  const pathname = usePathname();
  const { replace } = useRouter();

  const handleClick = () => {
    toggleDropDown();
    
    // If clicking the already selected artist, unselect it
    if (isSelectedArtist) {
      setSelectedArtist(null);
      return;
    }
    
    if (pathname.includes("/chat/") && selectedArtist) {
      if (selectedArtist.account_id !== artist?.account_id) {
        replace("/chat");
      }
    }
    setSelectedArtist(artist);
  };


  // Truncate name if longer than 12 characters
  const displayName = artist?.name
    ? artist.name.length > 12
      ? `${artist.name.substring(0, 12)}...`
      : artist.name
    : "";

  return (
    <motion.div
      initial={isMini ? false : true}
      layout="position"
      role="button"
      tabIndex={0}
      className={cn(
        "py-2 w-full outline-none cursor-pointer",
        isMini
          ? [
              "flex justify-center items-center",
              isSelectedArtist && "w-fit rounded-full",
            ]
          : [
              "flex gap-3 items-center px-2 text-sm rounded-md text-foreground",
              isAnyArtistSelected && "hover:bg-accent",
              isSelectedArtist && "!bg-primary/10",
            ],
        shouldHighlight && "z-[70] relative"
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative p-0.5">
        <div
          className={cn(
            "w-8 h-8 aspect-1/1 rounded-full overflow-hidden flex items-center justify-center transition-colors",
            isSelectedArtist &&
              "ring-1 ring-foreground",
            shouldHighlight && "brightness-110 shadow-md ring-2 ring-primary/50"
          )}
        >
          <ImageWithFallback
            src={artist?.image || ""}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      </div>
      {!isMini && (
        <>
          <div
            key={artist?.account_id}
            className={cn(
              "text-left grow text-foreground min-w-0 truncate",
              shouldHighlight && "font-medium"
            )}
            title={artist?.name || ""}
          >
            {displayName}
          </div>
          <div className="ml-auto flex gap-1 flex-shrink-0">
            <ArtistActionButton
              onClick={(e) => {
                e.stopPropagation();
                void togglePin();
              }}
              disabled={isPinning}
              isVisible={isHovered || isSelectedArtist}
              title={artist?.pinned ? "Unpin artist" : "Pin artist"}
              ariaLabel={artist?.pinned ? "Unpin artist" : "Pin artist"}
            >
              {artist?.pinned ? (
                <Pin className="size-4 text-primary" />
              ) : (
                <PinOff className="size-4 text-muted-foreground" />
              )}
            </ArtistActionButton>
            
            <ArtistActionButton
              onClick={(e) => {
                e.stopPropagation();
                if (artist) toggleUpdate(artist);
                toggleSettingModal();
              }}
              isVisible={isHovered || isSelectedArtist}
              title="Edit artist settings"
              ariaLabel="Edit artist settings"
            >
              <EllipsisVertical className="size-5 rotate-90 text-muted-foreground" />
            </ArtistActionButton>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Artist;
