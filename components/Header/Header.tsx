"use client";

import { MenuIcon, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SideMenu from "../SideMenu";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useArtistProvider } from "@/providers/ArtistProvider";
import ImageWithFallback from "../ImageWithFallback";
import useIsMobile from "@/hooks/useIsMobile";
import { useCloseOnRouteChange } from "@/hooks/useCloseOnRouteChange";
import type { ArtistRecord } from "@/types/Artist";

const Header = () => {
  const { push } = useRouter();
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  useCloseOnRouteChange(() => setIsOpenMobileMenu(false));
  const {
    selectedArtist,
    toggleSettingModal,
    toggleUpdate,
    toggleCreation,
    sorted,
  } = useArtistProvider();
  const isMobile = useIsMobile();
  const isArtistSelected = selectedArtist !== null;

  const handleClickPfp = () => {
    if (isMobile) {
      push("/artists");
      return;
    }
    // Update the artist details for editing
    toggleUpdate(selectedArtist as ArtistRecord);
    toggleSettingModal();
  };

  const handleAddArtist = () => {
    toggleCreation();
  };

  return (
    <>
      <div className="z-[50] fixed bg-card shadow-[0_1px_0_var(--border)] left-0 right-0 top-0 md:hidden flex px-4 py-2 items-center justify-between w-auto">
        <button
          type="button"
          className="md:hidden flex size-11 items-center justify-center gap-2 z-[50] rounded-xl hover:bg-muted"
          onClick={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
          aria-label="Open menu"
        >
          <MenuIcon className="dark:text-white" />
        </button>

        <Link href="/" aria-label="Recoup home">
          <Logo isExpanded />
        </Link>

        {/* Show Add/Select Artist button when on mobile, logged in, and no artist selected */}
        {isMobile && !isArtistSelected && (
          <button
            type="button"
            onClick={
              sorted.length > 0 ? () => push("/artists") : handleAddArtist
            }
            className="flex items-center gap-2 bg-secondary text-secondary-foreground font-medium p-3 rounded-full z-[50]"
            aria-label={
              sorted.length > 0 ? "Select your artist" : "Add a new artist"
            }
          >
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">
              {sorted.length > 0 ? "Select Your Artist" : "Add Your Artist"}
            </span>
          </button>
        )}

        {/* Show artist profile when artist is selected */}
        {selectedArtist && isMobile && (
          <div className="relative z-[50]">
            <button
              type="button"
              data-testid="mobile-pfp-button"
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
              onClick={handleClickPfp}
              aria-label="Open artist options"
            >
              <ImageWithFallback
                src={selectedArtist?.image || ""}
                className="w-full h-full object-cover rounded-full"
              />
            </button>
          </div>
        )}
        {isMobile && (
          <>
            <SideMenu
              isVisible={isOpenMobileMenu}
              toggleModal={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Header;
