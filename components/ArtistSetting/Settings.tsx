"use client";

import { MicVocal } from "lucide-react";
import Form from "../Form";
import { validation } from "@/lib/utils/setting";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { SETTING_MODE } from "@/types/Setting";
import Knowledges from "./Knowledges";
import ImageSelect from "./ImageSelect";
import KnowledgeSelect from "./KnowledgeSelect";
import Inputs from "./Inputs";
import DeleteModal from "./DeleteModal";
import AddToOrgButton from "./AddToOrgButton";
import { useState } from "react";
import AccountIdDisplay from "./AccountIdDisplay";
import { borderPatterns, buttonPatterns, iconPatterns, textPatterns } from "@/lib/styles/patterns";
import { cn } from "@/lib/utils";
import { useOrganization } from "@/providers/OrganizationProvider";
import { TabbedSettings } from "./TabbedSettings";

interface SettingsProps {
  /** Which tab to show initially (defaults to "general") */
  defaultTab?: string;
}

const Settings = ({ defaultTab = "general" }: SettingsProps) => {
  const {
    toggleSettingModal,
    saveSetting,
    updating,
    settingMode,
    knowledgeUploading,
    setSelectedArtist,
    editableArtist,
  } = useArtistProvider();
  const { selectedOrgId } = useOrganization();
  const [isVisibleDeleteModal, setIsVisibleDeleteModal] = useState(false);

  // Show "Add to Org" only when editing in Personal view
  const showAddToOrg = settingMode === SETTING_MODE.UPDATE && selectedOrgId === null;

  // Show tabs only when editing an existing artist (not create mode)
  const showTabs = settingMode === SETTING_MODE.UPDATE;

  const handleSave = async () => {
    const artistInfo = await saveSetting();
    // Only update selected artist if save was successful
    if (artistInfo) {
      setSelectedArtist(artistInfo);
    }
    toggleSettingModal();
  };

  // Header is shared between tabbed and non-tabbed views
  const header = (
    <div className={cn("col-span-12 flex justify-between items-center pb-3", borderPatterns.divider)}>
      <div className="flex gap-2 items-center">
        <MicVocal className={iconPatterns.primary} />
        <div className="flex flex-col">
          <p className={textPatterns.heading}>
            {settingMode === SETTING_MODE.CREATE
              ? "Add Artist"
              : "Artist Settings"}
          </p>
          {settingMode === SETTING_MODE.UPDATE && editableArtist && (
            <AccountIdDisplay
              accountId={editableArtist.account_id}
              label="Artist ID"
            />
          )}
        </div>
      </div>
    </div>
  );

  // The general settings form content (shared between tabbed and non-tabbed)
  const generalContent = (
    <>
      <div className="col-span-4 space-y-1 md:space-y-2">
        <p className="text-sm text-muted-foreground">Artist Image</p>
        <ImageSelect />
      </div>
      <Inputs />
      <div className="col-span-7 md:col-span-5 space-y-1 md:space-y-2">
        <p className="text-sm text-muted-foreground">Knowledge Base</p>
        <KnowledgeSelect />
      </div>
      <div className="col-span-7 space-y-1 md:space-y-2 flex flex-col justify-end items-start">
        {knowledgeUploading ? (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        ) : (
          <Knowledges />
        )}
      </div>
      <button
        className={cn(buttonPatterns.primary, "col-span-12 py-2")}
        type="submit"
      >
        {updating ? "Saving..." : "Save"}
      </button>
      {showAddToOrg && editableArtist && (
        <AddToOrgButton artistId={editableArtist.account_id} />
      )}
      <button
        className={cn(buttonPatterns.danger, "col-span-12 py-2 mb-4")}
        onClick={() => setIsVisibleDeleteModal(true)}
        type="button"
      >
        Delete
      </button>
      {isVisibleDeleteModal && (
        <DeleteModal
          toggleModal={() => setIsVisibleDeleteModal(!isVisibleDeleteModal)}
        />
      )}
    </>
  );

  // Non-tabbed layout: CREATE mode
  if (!showTabs) {
    return (
      <Form
        id="artist-setting"
        className="w-full grid grid-cols-12 gap-2 md:gap-3"
        validationSchema={validation}
        onSubmit={handleSave}
      >
        {header}
        {generalContent}
      </Form>
    );
  }

  // Tabbed layout: UPDATE mode for artists
  return (
    <TabbedSettings
      header={header}
      generalContent={generalContent}
      defaultTab={defaultTab}
      artistAccountId={editableArtist!.account_id}
      onSave={handleSave}
    />
  );
};

export default Settings;
