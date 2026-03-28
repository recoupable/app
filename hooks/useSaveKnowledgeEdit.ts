import { useArtistProvider } from "@/providers/ArtistProvider";
import getMimeFromPath from "@/lib/files/getMimeFromPath";
import { uploadFile } from "@/lib/arweave/uploadFile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

type UseSaveKnowledgeEditArgs = {
  name: string;
  url: string;
  editedText: string;
};

export const useSaveKnowledgeEdit = ({
  name,
  url,
  editedText,
}: UseSaveKnowledgeEditArgs) => {
  const {
    knowledgeUploading,
    setKnowledgeUploading,
    bases,
    setBases,
    saveSetting,
    selectedArtist,
  } = useArtistProvider();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    const mime = getMimeFromPath(name || url);
    if (mime === "application/json") {
      try {
        JSON.parse(editedText);
      } catch {
        toast.warn("Invalid JSON; saving as-is");
      }
    }
    try {
      setKnowledgeUploading(true);
      const file = new File([editedText], name || "file.txt", { type: mime });
      const { uri } = await uploadFile(file);
      const next = bases.map((b) => ({ ...b }));
      const idx = next.findIndex((b) => b.url === url && b.name === name);
      if (idx >= 0) {
        next[idx] = { name, url: uri, type: mime } as {
          name: string;
          url: string;
          type: string;
        };
        setBases(next);
      }
      try {
        await saveSetting(next);
        const artistId = selectedArtist?.account_id;
        if (artistId) {
          await queryClient.invalidateQueries({
            queryKey: ["artist-knowledge", artistId],
          });
          await queryClient.invalidateQueries({
            queryKey: ["artist-knowledge-text"],
          });
        }
        toast.success("Saved");
        return true;
      } catch {
        toast.error("Failed to save changes");
        return false;
      }
    } catch {
      toast.error("Upload failed");
      return false;
    } finally {
      setKnowledgeUploading(false);
    }
  };

  return { handleSave, isSaving: knowledgeUploading };
};

export default useSaveKnowledgeEdit;
