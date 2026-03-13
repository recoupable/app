import { z } from "zod";
import { tool } from "ai";
import { findFileByName } from "@/lib/supabase/files/findFileByName";
import { updateFileName } from "@/lib/supabase/files/updateFileName";
import { isValidFileName } from "@/utils/isValidFileName";
import { isValidPath } from "@/utils/isValidPath";
import supabase from "@/lib/supabase/serverClient";
import { escapeLikePattern } from "@/lib/files/escapeLikePattern";
import { generateStorageKey } from "@/lib/files/generateStoragePath";
import { handleToolError } from "@/lib/files/handleToolError";
import { copyFileByKey } from "@/lib/supabase/storage/copyFileByKey";
import { deleteFileByKey } from "@/lib/supabase/storage/deleteFileByKey";

const renameFolder = tool({
  description: `
Rename a folder/directory in storage. Use this to fix typos or improve folder naming.

When to use:
- Fix typo in folder name
- Update folder name for better clarity
- Standardize folder naming conventions

Important:
- All files and subfolders inside are automatically updated
- New name must not already exist in the same directory
- Folder stays in same location (use move_file to change location)
- Special characters and path separators are not allowed
`,
  inputSchema: z.object({
    folderName: z.string().describe("Current name of the folder (e.g., 'Albums', 'old-folder')"),
    newFolderName: z.string().describe("New name for the folder (e.g., 'Music', 'new-folder')"),
    path: z
      .string()
      .optional()
      .describe("Optional parent directory path (e.g., 'projects', 'documents')"),
    active_account_id: z.string().describe("Pull active_account_id from the system prompt"),
    active_artist_id: z.string().describe("Pull active_artist_id from the system prompt"),
  }),
  execute: async ({ folderName, newFolderName, path, active_account_id, active_artist_id }) => {
    try {
      if (path && !isValidPath(path)) {
        return {
          success: false,
          error: "Invalid path provided.",
          message: `Path '${path}' is invalid.`,
        };
      }

      const folderRecord = await findFileByName(
        folderName,
        active_account_id,
        active_artist_id,
        path,
      );

      if (!folderRecord) {
        return {
          success: false,
          error: `Folder '${folderName}' not found.`,
          message: `Cannot rename - folder '${folderName}' does not exist.`,
        };
      }

      if (!folderRecord.is_directory) {
        return {
          success: false,
          error: `'${folderName}' is a file, not a folder.`,
          message: "Use rename_file to rename files.",
        };
      }

      if (!isValidFileName(newFolderName)) {
        return {
          success: false,
          error: "Invalid new folder name.",
          message: `Name '${newFolderName}' is invalid.`,
        };
      }

      if (folderName === newFolderName) {
        return {
          success: false,
          error: "New name is the same as current name.",
          message: `Folder is already named '${folderName}'.`,
        };
      }

      const existingFolder = await findFileByName(
        newFolderName,
        active_account_id,
        active_artist_id,
        path,
      );

      if (existingFolder) {
        return {
          success: false,
          error: `Folder '${newFolderName}' already exists.`,
          message: `Cannot rename - a folder named '${newFolderName}' already exists.`,
        };
      }

      const newStorageKey = generateStorageKey(
        active_account_id,
        active_artist_id,
        `${newFolderName}/`,
        path,
      );
      const oldStorageKey = folderRecord.storage_key;

      const escapedKey = escapeLikePattern(oldStorageKey);
      const { data: children, error: childrenError } = await supabase
        .from("files")
        .select("id, storage_key")
        .like("storage_key", `${escapedKey}%`)
        .neq("id", folderRecord.id);

      if (childrenError) {
        throw new Error(`Failed to find children: ${childrenError.message}`);
      }

      if (children && children.length > 0) {
        for (const child of children) {
          const newChildStorageKey = child.storage_key.replace(oldStorageKey, newStorageKey);

          // Only move actual files in storage, not directory records
          const isChildDirectory = child.storage_key.endsWith("/");

          if (!isChildDirectory) {
            // Copy file to new location in storage
            try {
              await copyFileByKey(child.storage_key, newChildStorageKey);
            } catch (copyError) {
              throw new Error(
                `Failed to copy file in storage: ${copyError instanceof Error ? copyError.message : "Unknown error"}`,
              );
            }
          }

          // Update database record with new storage_key
          const { error: updateError } = await supabase
            .from("files")
            .update({
              storage_key: newChildStorageKey,
              updated_at: new Date().toISOString(),
            })
            .eq("id", child.id);

          if (updateError) {
            throw new Error(`Failed to update child database record: ${updateError.message}`);
          }

          // Delete old file from storage
          if (!isChildDirectory) {
            try {
              await deleteFileByKey(child.storage_key);
            } catch {
              // Silently continue if delete fails - database is already updated
              // Old file will be orphaned but new file works correctly
            }
          }
        }
      }

      await updateFileName(folderRecord.id, newFolderName, newStorageKey);

      return {
        success: true,
        oldName: folderName,
        newName: newFolderName,
        childrenUpdated: children?.length || 0,
        path: path || "root",
        storageKey: newStorageKey,
        message: `Successfully renamed folder '${folderName}' to '${newFolderName}'${children?.length ? ` (updated ${children.length} items inside)` : ""}.`,
      };
    } catch (error) {
      return handleToolError(error, "rename folder", folderName);
    }
  },
});

export default renameFolder;
