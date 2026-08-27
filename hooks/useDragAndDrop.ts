import { useDropzone, FileRejection } from "react-dropzone";
import { useCallback } from "react";
import { toast } from "sonner";

type UseDragAndDropConfig = {
  onDrop: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
  disabled?: boolean;
};

/**
 * Hook to handle drag-and-drop file upload using react-dropzone
 * Provides drag state and handlers for file upload
 */
export function useDragAndDrop({
  onDrop,
  maxFiles = 100,
  maxSizeMB = 100,
  allowedTypes = [],
  disabled = false,
}: UseDragAndDropConfig) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  /**
   * Validate file extension against blocked list
   */
  const isBlockedFile = useCallback(
    (fileName: string): boolean => {
      // Blocked file types for security
      const blockedExtensions = [".exe", ".dll", ".bat", ".sh", ".cmd"];
      const lowerName = fileName.toLowerCase();
      return blockedExtensions.some((ext) => lowerName.endsWith(ext));
    },
    []
  );

  /**
   * Handle accepted files
   */
  const handleAcceptedFiles = useCallback(
    (acceptedFiles: File[]) => {
      // Filter out blocked file types (additional security check)
      const safeFiles = acceptedFiles.filter((file) => {
        if (isBlockedFile(file.name)) {
          toast.error(`File type not allowed: ${file.name}`);
          return false;
        }
        return true;
      });

      if (safeFiles.length > 0) {
        onDrop(safeFiles);
      }
    },
    [onDrop, isBlockedFile]
  );

  /**
   * Handle rejected files
   */
  const handleRejectedFiles = useCallback(
    (fileRejections: FileRejection[]) => {
      fileRejections.forEach((rejection) => {
        const { file, errors } = rejection;
        
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            toast.error(`File "${file.name}" exceeds ${maxSizeMB}MB limit`);
          } else if (error.code === "too-many-files") {
            toast.error(`Maximum ${maxFiles} files allowed`);
          } else if (error.code === "file-invalid-type") {
            toast.error(`File type not allowed: ${file.name}`);
          } else {
            toast.error(`Error uploading ${file.name}: ${error.message}`);
          }
        });
      });
    },
    [maxFiles, maxSizeMB]
  );

  // Configure react-dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop: handleAcceptedFiles,
    onDropRejected: handleRejectedFiles,
    maxFiles,
    maxSize: maxSizeBytes,
    accept: allowedTypes.length > 0 
      ? allowedTypes.reduce((acc, ext) => {
          // Convert extensions to MIME types for react-dropzone
          acc[ext] = [];
          return acc;
        }, {} as Record<string, string[]>)
      : undefined,
    disabled,
    noClick: true,  // Prevent click to upload (we have a separate upload button)
    noKeyboard: true,
  });

  return {
    getRootProps,
    getInputProps,
    isDragging: isDragActive,
    isDragReject,
  };
}

