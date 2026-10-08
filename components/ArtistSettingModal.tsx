"use client";

import { useEffect, useRef } from "react";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Settings from "./ArtistSetting/Settings";

const ArtistSettingModal = () => {
  const { isOpenSettingModal, setIsOpenSettingModal, editableArtist } =
    useArtistProvider();
  const { selectedOrgId } = useOrganization();
  const previousOrg = useRef(selectedOrgId);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (previousOrg.current !== selectedOrgId) {
      setIsOpenSettingModal(false);
      previousOrg.current = selectedOrgId;
    }
  }, [selectedOrgId, setIsOpenSettingModal]);

  return (
    <Dialog open={isOpenSettingModal} onOpenChange={setIsOpenSettingModal}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto"
        aria-describedby={undefined}
        onOpenAutoFocus={() => {
          opener.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          if (opener.current?.isConnected) opener.current.focus();
        }}
      >
        <DialogTitle>
          Artist settings for {editableArtist?.name || "artist"}
        </DialogTitle>
        <Settings key={editableArtist?.account_id} />
      </DialogContent>
    </Dialog>
  );
};

export default ArtistSettingModal;
