import { useUserProvider } from "@/providers/UserProvder";
import { ArtistRecord } from "@/types/Artist";
import { SETTING_MODE } from "@/types/Setting";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";

const useArtistMode = (
  clearParams: () => void,
  setEditableArtist: Dispatch<SetStateAction<ArtistRecord | null>>
) => {
  const [settingMode, setSettingMode] = useState(SETTING_MODE.UPDATE);
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const { email } = useUserProvider();
  const { push } = useRouter();

  const toggleCreation = () => {
    clearParams();
    if (!email) return;
    push("/?q=create a new artist");
  };

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
    settingMode,
    setSettingMode,
    isOpenSettingModal,
    setIsOpenSettingModal,
  };
};

export default useArtistMode;
