import { useUserProvider } from "@/providers/UserProvder";
import { ArtistRecord } from "@/types/Artist";
import { SETTING_MODE } from "@/types/Setting";
import { Dispatch, SetStateAction, useState } from "react";

const useArtistMode = (
  clearParams: () => void,
  setEditableArtist: Dispatch<SetStateAction<ArtistRecord | null>>,
) => {
  const [settingMode, setSettingMode] = useState(SETTING_MODE.UPDATE);
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const { email } = useUserProvider();

  // Opens the shared Spotify-search dialog (AddArtistDialog). Previously this
  // pushed `/?q=create a new artist`, which the onboarding router now
  // intercepts for incomplete accounts — dead-ending in an /artists loop.
  const toggleCreation = () => {
    if (!email) return;
    clearParams();
    setIsCreationOpen(true);
  };

  const closeCreation = () => setIsCreationOpen(false);

  const toggleUpdate = (artist: ArtistRecord) => {
    setSettingMode(SETTING_MODE.UPDATE);
    setEditableArtist(artist);
  };

  const toggleSettingModal = () => {
    setIsOpenSettingModal(!isOpenSettingModal);
  };

  return {
    toggleUpdate,
    toggleSettingModal,
    toggleCreation,
    closeCreation,
    isCreationOpen,
    settingMode,
    setSettingMode,
    isOpenSettingModal,
    setIsOpenSettingModal,
  };
};

export default useArtistMode;
