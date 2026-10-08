"use client";

import { useEffect, useRef } from "react";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Settings from "./ArtistSetting/Settings";

const ArtistSettingModal = () => {
  const { isOpenSettingModal, setIsOpenSettingModal, editableArtist } =
    useArtistProvider();
  const { selectedOrgId, isInitialized } = useOrganization();
  const previousOrg = useRef<string | null | undefined>(undefined);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      previousOrg.current = undefined;
      return;
    }
    if (
      previousOrg.current !== undefined &&
      previousOrg.current !== selectedOrgId
    ) {
      setIsOpenSettingModal(false);
    }
    previousOrg.current = selectedOrgId;
  }, [selectedOrgId, isInitialized, setIsOpenSettingModal]);

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
          if (opener.current?.isConnected && opener.current !== document.body) {
            event.preventDefault();
            opener.current.focus();
          }
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
