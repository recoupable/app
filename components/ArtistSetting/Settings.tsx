"use client";

import { MicVocal, FolderOpen } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArtistConnectorsTab } from "./ArtistConnectorsTab";

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
  
  // Determine if this is a workspace (not an artist)
  const isWorkspace = editableArtist?.isWorkspace === true;
  
  // Show "Add to Org" only when editing in Personal view
  const showAddToOrg = settingMode === SETTING_MODE.UPDATE && selectedOrgId === null;
  const entityLabel = isWorkspace ? "Workspace" : "Artist";

  // Show tabs only when editing an existing artist (not workspace, not create mode)
  const showTabs = settingMode === SETTING_MODE.UPDATE && !isWorkspace;

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
        {isWorkspace ? (
          <FolderOpen className={iconPatterns.primary} />
        ) : (
          <MicVocal className={iconPatterns.primary} />
        )}
        <div className="flex flex-col">
          <p className={textPatterns.heading}>
            {settingMode === SETTING_MODE.CREATE
              ? `Add ${entityLabel}`
              : `${entityLabel} Settings`}
          </p>
          {settingMode === SETTING_MODE.UPDATE && editableArtist && (
            <AccountIdDisplay accountId={editableArtist.account_id} label={`${entityLabel} ID`} />
          )}
        </div>
      </div>
    </div>
  );

  // The general settings form content (shared between tabbed and non-tabbed)
  const generalContent = (
    <>
      <div className="col-span-4 space-y-1 md:space-y-2">
        <p className="text-sm text-muted-foreground">{entityLabel} Image</p>
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

  // Non-tabbed layout: CREATE mode or workspace mode
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
    <div className="w-full">
      {header}
      <Tabs defaultValue={defaultTab} className="w-full mt-2">
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">
            General
          </TabsTrigger>
          <TabsTrigger value="connectors" className="flex-1">
            Connectors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Form
            id="artist-setting"
            className="w-full grid grid-cols-12 gap-2 md:gap-3"
            validationSchema={validation}
            onSubmit={handleSave}
          >
            {generalContent}
          </Form>
        </TabsContent>

        <TabsContent value="connectors">
          {editableArtist && (
            <ArtistConnectorsTab artistAccountId={editableArtist.account_id} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
