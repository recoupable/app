"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import isImagePath from "@/utils/isImagePath";
import isTextPath from "@/utils/isTextPath";
import isTextMimeType from "@/utils/isTextMimeType";
import { useTextFileContent } from "@/hooks/useTextFileContent";
import { useArtistProvider } from "@/providers/ArtistProvider";
import useSaveKnowledgeEdit from "@/hooks/useSaveKnowledgeEdit";
import useKnowledgeEditor from "@/hooks/useKnowledgeEditor";
import KnowledgePreview from "./KnowledgePreview";

type KnowledgeDialogProps = {
  name: string;
  url: string;
  type?: string;
  children: ReactNode;
};

const KnowledgeDialog = ({ name, url, type, children }: KnowledgeDialogProps) => {
  const isImage = isImagePath(url) || (name ? isImagePath(name) : false) || (!!type && type.startsWith("image/"));
  const ext = (() => {
    const base = (name || url).split("?")[0];
    const part = base.includes(".") ? base.split(".").pop() : undefined;
    return (part || "file").toUpperCase();
  })(); // Create PNG, JPG, TXT etc. label etc.
  const isText = isTextPath(url) || (name ? isTextPath(name) : false) || isTextMimeType(type);
  const { content: textContent, loading, error } = useTextFileContent(isText ? url : null);
  const { knowledgeUploading } = useArtistProvider();
  const { isEditing, setIsEditing, editedText, setEditedText, isOpen, handleOpenChange } =
    useKnowledgeEditor({ isText, textContent });

  const { handleSave, isSaving } = useSaveKnowledgeEdit({ name, url, editedText });

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[96vw] sm:w-[92vw] max-w-5xl pt-3 z-[1000] max-h-[90vh] overflow-hidden grid grid-rows-[auto,1fr]">
        <div className="flex flex-wrap items-start sm:items-center justify-between gap-2 sm:gap-3 border-b px-3 py-2 sm:px-4 sm:py-3 bg-background/80 backdrop-blur">
          <div className="min-w-0">
            <DialogHeader><DialogTitle className="truncate text-sm sm:text-base font-medium">{name || "File"}</DialogTitle></DialogHeader>
            <div className="mt-1"><Badge variant="secondary" className="text-[10px] sm:text-[11px]">{ext}</Badge></div>
          </div>
          <div className="ml-0 sm:ml-4 shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
            {isText && !isEditing && (<Button size="sm" variant="outline" className="h-8 px-2 text-xs sm:px-3" onClick={() => setIsEditing(true)}>Edit</Button>)}
            {isText && isEditing && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-2 text-xs sm:px-3"
                  onClick={() => {
                    setEditedText(textContent);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-2 text-xs sm:px-3"
                  disabled={loading || knowledgeUploading || isSaving}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </>
            )}
            <Button asChild size="sm" variant="secondary" className="h-8 px-2 text-xs sm:px-3">
              <a href={url} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </Button>
          </div>
        </div>
        <KnowledgePreview
          isImage={isImage}
          isText={isText}
          isEditing={isEditing}
          editedText={editedText}
          setEditedText={setEditedText}
          loading={loading}
          error={error || null}
          textContent={textContent}
          url={url}
          name={name}
        />
      </DialogContent>
    </Dialog>
  );
};

export default KnowledgeDialog;