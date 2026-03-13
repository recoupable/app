import { CHAT_INPUT_SUPPORTED_FILE } from "@/lib/chat/config";
import { getFileExtension } from "./getFileExtension";

const allowedExtensions = new Set(
  Object.values(CHAT_INPUT_SUPPORTED_FILE)
    .flat()
    .map((extension: string) => extension.toLowerCase()),
);

/**
 * Checks if a file is allowed based on its extension.
 * Useful for browsers that report empty or generic MIME types.
 *
 * @param file - The File object to check
 * @returns true if the file extension is in the allowed list
 */
export function isAllowedByExtension(file: File): boolean {
  const extension = getFileExtension(file.name);
  return extension ? allowedExtensions.has(extension.toLowerCase()) : false;
}
