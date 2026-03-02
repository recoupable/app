"use client";

import { useArtistProvider } from "@/providers/ArtistProvider";
import Modal from "./Modal";
import Settings from "./ArtistSetting/Settings";

const ArtistSettingModal = () => {
  const { isOpenSettingModal, toggleSettingModal } = useArtistProvider();

  return (
    <>
      {isOpenSettingModal && (
        <Modal onClose={toggleSettingModal}>
          <Settings />
        </Modal>
      )}
    </>
  );
};

export default ArtistSettingModal;
