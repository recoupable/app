import { useRef } from "react";
import { FileUIPart } from "ai";
import { usePrivy } from "@privy-io/react-auth";
import { useVercelChatContext } from "@/providers/VercelChatProvider";
import { CHAT_INPUT_SUPPORTED_FILE } from "@/lib/chat/config";
import { isAllowedByExtension } from "@/lib/files/isAllowedByExtension";
import { getFileExtension } from "@/lib/files/getFileExtension";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";

export function usePureFileAttachments() {
  const { setAttachments, addTextAttachment } = useVercelChatContext();
  const { getAccessToken } = usePrivy();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILES = 10;
  const allowedTypes = Object.keys(CHAT_INPUT_SUPPORTED_FILE);

  const uploadFile = async (file: File) => {
    // Accept by MIME type first, then fall back to extension for browsers that
    // report empty or generic MIME types (common for .md files).
    const isAllowedMimeType = allowedTypes.includes(file.type);
    if (!isAllowedMimeType && !isAllowedByExtension(file)) {
      console.error("File type not supported:", file.type);
      return;
    }

    const ext = getFileExtension(file.name).toLowerCase();

    // Handle CSV files
    if (file.type === "text/csv" || ext === ".csv") {
      await addTextAttachment(file, "csv");
      return;
    }

    // Handle markdown files
    const isMarkdown =
      file.type === "text/markdown" ||
      file.type === "text/x-markdown" ||
      ext === ".md" ||
      ext === ".markdown";

    if (isMarkdown) {
      await addTextAttachment(file, "md");
      return;
    }

    // Create a pending attachment with temporary URL for immediate preview
    const tempUrl = URL.createObjectURL(file);
    const pendingAttachment: FileUIPart = {
      type: "file",
      filename: file.name,
      mediaType: file.type,
      url: tempUrl, // Temporary URL for initial preview
    };

    // Add the pending attachment to the state
    setAttachments((prev: FileUIPart[]) => [...prev, pendingAttachment]);

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${getClientApiBaseUrl()}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Upload failed");
      }

      // Update the attachment with the uploaded URL
      setAttachments((prev: FileUIPart[]) =>
        prev.map((attachment: FileUIPart) =>
          // Compare by URL since object references won't match
          attachment.url === tempUrl
            ? ({
                type: "file",
                filename: data.fileName,
                mediaType: data.fileType,
                url: data.url,
              } as FileUIPart)
            : attachment,
        ),
      );

      // Revoke the temporary object URL to avoid memory leaks
      URL.revokeObjectURL(tempUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
      // Remove the failed attachment
      setAttachments((prev: FileUIPart[]) =>
        prev.filter((a: FileUIPart) => a.url !== tempUrl),
      );
      // Revoke the temporary object URL
      URL.revokeObjectURL(tempUrl);
    }
  };

  const handleFileChange = () => {
    const files = Array.from(fileInputRef.current?.files || []);

    // Limit to MAX_FILES
    const filesToUpload = files.slice(0, MAX_FILES) as File[];

    if (files.length > MAX_FILES) {
      console.warn(`Only the first ${MAX_FILES} files will be uploaded`);
    }

    filesToUpload.forEach(uploadFile);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return {
    fileInputRef,
    handleFileChange,
    MAX_FILES,
    uploadFile,
    allowedTypes,
  };
}
