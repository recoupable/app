import supabase from "@/lib/supabase/serverClient";
import { isValidFileName } from "@/utils/isValidFileName";
import { isValidStorageKey } from "@/utils/isValidStorageKey";
import { isValidUUID } from "@/utils/isValidUUID";

/**
 * Checks if storage key contains control characters
 *
 * @param key - Storage key to check
 * @returns true if contains control characters, false otherwise
 */
function hasControlCharacters(key: string): boolean {
  // Control characters are 0x00-0x1F and 0x7F-0x9F
  return /[\x00-\x1F\x7F-\x9F]/.test(key);
}

/**
 * Update the file_name and storage_key of a file record (used for rename operations)
 *
 * @param fileId - UUID of the file record to update
 * @param newFileName - New display name for the file
 * @param newStorageKey - New storage key path
 * @throws Error if validation fails or update fails
 */
export async function updateFileName(
  fileId: string,
  newFileName: string,
  newStorageKey: string,
): Promise<void> {
  // Validate fileId is a valid UUID
  if (!isValidUUID(fileId)) {
    throw new Error(`Invalid file ID format: must be a valid UUID`);
  }

  // Validate newFileName is non-empty and contains valid characters
  if (!newFileName || newFileName.trim().length === 0) {
    throw new Error("File name cannot be empty");
  }

  if (!isValidFileName(newFileName)) {
    throw new Error(
      "Invalid file name: must not contain path separators, path traversal sequences, " +
        "control characters, or reserved names, and must be 255 characters or less",
    );
  }

  // Validate newStorageKey format and security
  if (!newStorageKey || newStorageKey.trim().length === 0) {
    throw new Error("Storage key cannot be empty");
  }

  if (!isValidStorageKey(newStorageKey)) {
    throw new Error(
      "Invalid storage key: must not start with /, contain path traversal (..), " +
        "or backslashes, and must be 1024 characters or less",
    );
  }

  // Check for control characters in storage key
  if (hasControlCharacters(newStorageKey)) {
    throw new Error("Storage key cannot contain control characters");
  }

  // All validation passed, proceed with update
  const { error } = await supabase
    .from("files")
    .update({
      file_name: newFileName,
      storage_key: newStorageKey,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fileId);

  if (error) {
    throw new Error(`Failed to update file name: ${error.message}`);
  }
}
