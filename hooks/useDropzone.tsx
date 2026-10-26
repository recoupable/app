import { useCallback } from "react";
import { useDropzone as useReactDropzone } from "react-dropzone";
import { usePureFileAttachments } from "./usePureFileAttachments";
import { CHAT_INPUT_SUPPORTED_FILE } from "@/lib/chat/config";
import { toast } from "sonner";

export const useDropzone = () => {
  const { uploadFile, MAX_FILES } = usePureFileAttachments();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Limit to MAX_FILES
      const filesToUpload = acceptedFiles.slice(0, MAX_FILES);

      if (acceptedFiles.length > MAX_FILES) {
        console.warn(`Only the first ${MAX_FILES} files will be uploaded`);
      }

      filesToUpload.forEach(async (file) => {
        try {
          await uploadFile(file);
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      });
    },
    [uploadFile, MAX_FILES],
  );

  return useReactDropzone({
    onDrop,
    onDropRejected: (rejections) => {
      const tooMany = rejections.some(({ errors }) =>
        errors.some(({ code }) => code === "too-many-files"),
      );
      toast.error(
        tooMany
          ? `Choose up to ${MAX_FILES} files at a time.`
          : "This file type is not supported. Choose an image, PDF, CSV, Markdown, or supported audio file.",
      );
    },
    noClick: true,
    accept: CHAT_INPUT_SUPPORTED_FILE,
    multiple: true,
    maxFiles: MAX_FILES,
  });
};
