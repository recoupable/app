import { useEffect, useRef } from "react";
import { FileUIPart } from "ai";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useOrganization } from "@/providers/OrganizationProvider";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";
import { CHAT_INPUT_SUPPORTED_FILE } from "@/lib/chat/config";
import { isAllowedByExtension } from "@/lib/files/isAllowedByExtension";
import { getFileExtension } from "@/lib/files/getFileExtension";
import { preparePublicUpload } from "@/lib/files/preparePublicUpload";
import { usePublicUpload } from "./usePublicUpload";
import { toast } from "sonner";

export function usePureFileAttachments() {
  const { id, sessionId, setAttachments, addTextAttachment } =
    useVercelChatContext();
  const { selectedArtist } = useArtistProvider();
  const { selectedOrgId } = useOrganization();
  const { email, accountIdOverride } = useAccountOverride();
  const upload = usePublicUpload(
    JSON.stringify([
      id,
      sessionId,
      selectedArtist?.account_id,
      selectedOrgId,
      email,
      accountIdOverride,
    ]),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previews = useRef(new Set<string>());
  const MAX_FILES = 10;
  const allowedTypes = Object.keys(CHAT_INPUT_SUPPORTED_FILE);

  useEffect(() => {
    const ownedPreviews = previews.current;
    return () => {
      const urls = new Set(ownedPreviews);
      urls.forEach((url) => URL.revokeObjectURL(url));
      ownedPreviews.clear();
      if (urls.size)
        setAttachments((previous) =>
          previous.filter((part) => !urls.has(part.url)),
        );
    };
  }, [upload.scope, setAttachments]);

  const uploadFile = async (file: File) => {
    const operation = upload.begin();
    let tempUrl: string | undefined;
    try {
      if (!allowedTypes.includes(file.type) && !isAllowedByExtension(file)) {
        throw new Error(
          "This file type is not supported. Choose an image, PDF, CSV, Markdown, or supported audio file.",
        );
      }
      const ext = getFileExtension(file.name).toLowerCase();
      // Text attachments stay local; they must not be copied to public storage.
      if (file.type === "text/csv" || ext === ".csv") {
        await addTextAttachment(file, "csv", operation.isCurrent);
        return;
      }
      if (
        file.type === "text/markdown" ||
        file.type === "text/x-markdown" ||
        ext === ".md" ||
        ext === ".markdown"
      ) {
        await addTextAttachment(file, "md", operation.isCurrent);
        return;
      }
      const prepared = preparePublicUpload(file);
      tempUrl = URL.createObjectURL(prepared);
      previews.current.add(tempUrl);
      const pending: FileUIPart = {
        type: "file",
        filename: file.name,
        mediaType: prepared.type,
        url: tempUrl,
      };
      setAttachments((previous) => [...previous, pending]);
      const data = await operation.upload(prepared);
      if (operation.isCurrent())
        setAttachments((previous) =>
          previous.map((attachment) =>
            attachment.url === tempUrl
              ? {
                  type: "file",
                  filename: data.fileName,
                  mediaType: data.fileType,
                  url: data.url,
                }
              : attachment,
          ),
        );
    } catch (error) {
      operation.reportError(error);
    } finally {
      if (tempUrl) {
        // Retire our preview even if the API origin changed before a render.
        // Matching the owned blob URL cannot remove the destination view's files.
        setAttachments((previous) =>
          previous.filter((part) => part.url !== tempUrl),
        );
        previews.current.delete(tempUrl);
        URL.revokeObjectURL(tempUrl);
      }
      operation.finish();
    }
  };

  const handleFileChange = () => {
    const files = Array.from(fileInputRef.current?.files || []);
    if (files.length > MAX_FILES)
      toast.error(
        `Choose up to ${MAX_FILES} files at a time. Only the first ${MAX_FILES} will be attached.`,
      );
    files.slice(0, MAX_FILES).forEach(uploadFile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  return {
    fileInputRef,
    handleFileChange,
    MAX_FILES,
    uploadFile,
    allowedTypes,
  };
}
