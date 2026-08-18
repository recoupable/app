"use client";

import { MenuIcon, PlusCircle } from "lucide-react";
import { useState } from "react";
import SideMenu from "../SideMenu";
import { useArtistProvider } from "@/providers/ArtistProvider";
import ImageWithFallback from "../ImageWithFallback";
import useIsMobile from "@/hooks/useIsMobile";
import SideArtists from "../SideArtists";
import type { ArtistRecord } from "@/types/Artist";

const Header = () => {
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [isOpenSideArtists, setIsOpenSideArtists] = useState(false);
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
      setIsOpenSideArtists(true);
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
      <div className="z-[50] fixed bg-card  left-0 right-0 top-0 md:hidden flex p-4 items-center justify-between w-auto">
        <button
          type="button"
          className="md:hidden flex items-center gap-2 z-[50]"
          onClick={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
          aria-label="Open menu"
        >
          <MenuIcon className="dark:text-white" />
        </button>

        {/* Show Add/Select Artist button when on mobile, logged in, and no artist selected */}
        {isMobile && !isArtistSelected && (
          <button
            type="button"
            onClick={
              sorted.length > 0
                ? () => setIsOpenSideArtists(true)
                : handleAddArtist
            }
            className="flex items-center gap-2 bg-card text-black font-medium py-2 px-4 rounded-md shadow-md z-[50]"
            aria-label={
              sorted.length > 0 ? "Select your artist" : "Add a new artist"
            }
          >
            <PlusCircle className="h-5 w-5" />
            <span>
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
              onOpenArtists={() => setIsOpenSideArtists(true)}
            />
            <SideArtists
              isVisible={isOpenSideArtists}
              toggleModal={() => setIsOpenSideArtists(!isOpenSideArtists)}
            />
          </>
        )}
      </div>
    </>
  );
};

export default Header;
