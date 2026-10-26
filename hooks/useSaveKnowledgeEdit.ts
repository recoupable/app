import { useArtistProvider } from "@/providers/ArtistProvider";
import getMimeFromPath from "@/lib/files/getMimeFromPath";
import { usePublicUpload } from "./usePublicUpload";
import { useOrganization } from "@/providers/OrganizationProvider";
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
  const { editableArtist, bases, setBases, saveSetting } = useArtistProvider();
  const { selectedOrgId } = useOrganization();
  const upload = usePublicUpload(
    JSON.stringify([
      editableArtist?.account_id,
      selectedOrgId,
      name,
      url,
      bases,
    ]),
  );

  const handleSave = async () => {
    const mime = getMimeFromPath(name || url);
    if (mime === "application/json") {
      try {
        JSON.parse(editedText);
      } catch {
        toast.error("Invalid JSON. Correct the JSON before saving.");
        return false;
      }
    }
    const operation = upload.begin(true);
    try {
      const file = new File([editedText], name || "file.txt", { type: mime });
      const { url: uploadedUrl } = await operation.upload(file);
      if (!operation.isCurrent()) return false;
      const next = bases.map((b) => ({ ...b }));
      const idx = next.findIndex((b) => b.url === url && b.name === name);
      if (idx < 0)
        throw new Error(
          "This knowledge file changed. Reopen it before saving.",
        );
      next[idx] = { name, url: uploadedUrl, type: mime };
      try {
        const saved = await saveSetting(next, operation.isCurrent);
        if (!operation.isCurrent()) return false;
        if (!saved) throw new Error("Failed to save changes");
        setBases(next);
        toast.success("Saved");
        return true;
      } catch {
        if (operation.isCurrent()) toast.error("Failed to save changes");
        return false;
      }
    } catch (error) {
      operation.reportError(error);
      return false;
    } finally {
      operation.finish();
    }
  };

  return { handleSave, isSaving: upload.isUploading };
};

export default useSaveKnowledgeEdit;
