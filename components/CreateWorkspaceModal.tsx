"use client";

import { useState } from "react";
import { Music, FolderPlus, Loader } from "lucide-react";
import { toast } from "sonner";
import { usePrivy } from "@privy-io/react-auth";
import Modal from "./Modal";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";
import { cn } from "@/lib/utils";
import { NEW_API_BASE_URL } from "@/lib/consts";
import type { ArtistRecord } from "@/types/Artist";
import type { Tables } from "@/types/database.types";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type WorkspaceResponse = Tables<"accounts"> & {
  account_info?: Tables<"account_info">[];
  account_socials?: Tables<"account_socials">[];
};

function normalizeWorkspace(workspace: WorkspaceResponse): ArtistRecord {
  const accountInfo = workspace.account_info?.[0] || {};

  return {
    ...workspace,
    ...accountInfo,
    account_id: workspace.id,
    isWorkspace: true,
  };
}

const CreateWorkspaceModal = ({ isOpen, onClose }: CreateWorkspaceModalProps) => {
  const { 
    toggleCreation, 
    getArtists, 
    setIsCreatingArtist,
    setSelectedArtist,
    setEditableArtist,
    setIsOpenSettingModal,
  } = useArtistProvider();
  const { getAccessToken } = usePrivy();
  const { selectedOrgId } = useOrganization();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateArtist = () => {
    setIsCreatingArtist(true);
    toggleCreation();
    onClose();
  };

  const handleCreateWorkspace = async () => {
    setIsCreating(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error("Please sign in to create a workspace");
        return;
      }

      const response = await fetch(`${NEW_API_BASE_URL}/api/workspaces`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          organization_id: selectedOrgId,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.workspace) {
        const newWorkspace = normalizeWorkspace(data.workspace);
        
        setSelectedArtist(newWorkspace);
        setEditableArtist(newWorkspace);
        setIsOpenSettingModal(true);
        await getArtists();
      } else {
        toast.error(data.error || "Failed to create workspace");
      }
    } catch {
      toast.error("Failed to create workspace");
    } finally {
      setIsCreating(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} containerClasses="!w-full md:!w-[360px] !p-6">
      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-2">Create Workspace</h2>
        <p className="text-sm text-muted-foreground mb-6">
          A workspace keeps your knowledge, files, tasks, and chats organized around a topic.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleCreateArtist}
            disabled={isCreating}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border border-border",
              "hover:bg-accent hover:border-primary/20 transition-all",
              "text-left group"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Music className="size-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Artist</p>
              <p className="text-sm text-muted-foreground">
                Set up with AI to connect streaming and socials
              </p>
            </div>
          </button>

          <button
            onClick={handleCreateWorkspace}
            disabled={isCreating}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border border-border",
              "hover:bg-accent hover:border-primary/20 transition-all",
              "text-left group"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
              {isCreating ? (
                <Loader className="size-6 text-muted-foreground animate-spin" />
              ) : (
                <FolderPlus className="size-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">Blank Workspace</p>
              <p className="text-sm text-muted-foreground">
                Start empty and configure it yourself
              </p>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateWorkspaceModal;
