import { z } from "zod";
import { tool } from "ai";
import { findFileByName } from "@/lib/supabase/files/findFileByName";
import { deleteFileByKey } from "@/lib/supabase/storage/deleteFileByKey";
import { deleteFileRecord } from "@/lib/supabase/files/deleteFileRecord";
import { getFilesInDirectory } from "@/lib/supabase/files/getFilesInDirectory";
import { deleteFileRecords } from "@/lib/supabase/files/deleteFileRecords";
import { listFilesByArtist } from "@/lib/supabase/files/listFilesByArtist";
import { handleToolError } from "@/lib/files/handleToolError";
import { normalizeFileName } from "@/lib/files/normalizeFileName";

const deleteFile = tool({
  description: `
Delete a file or directory from storage. Use this to remove files the user no longer needs.

When to use:
- User wants to remove outdated research or reports
- Clean up temporary or incorrect files
- Delete empty directories
- Remove files before recreating them

Important:
- For directories, use recursive=true to delete contents
- Directory deletion without recursive flag will fail if not empty
- Deletion is permanent and cannot be undone
- Verify with user before deleting important files
`,
  inputSchema: z.object({
    fileName: z
      .string()
      .describe("Name of the file or directory to delete (e.g., 'research.md', 'old-reports')"),
    path: z
      .string()
      .optional()
      .describe("Optional subdirectory path where file is located (e.g., 'research', 'reports')"),
    recursive: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "If true, delete directory and all its contents. Required for non-empty directories.",
      ),
    active_account_id: z.string().describe("Pull active_account_id from the system prompt"),
    active_artist_id: z.string().describe("Pull active_artist_id from the system prompt"),
  }),
  execute: async ({ fileName, path, recursive, active_account_id, active_artist_id }) => {
    const normalizedFileName = normalizeFileName(fileName);

    try {
      let fileRecord = await findFileByName(
        normalizedFileName,
        active_account_id,
        active_artist_id,
        path,
      );

      // If not found with normalized name, try original (for directories)
      if (!fileRecord && normalizedFileName !== fileName) {
        fileRecord = await findFileByName(fileName, active_account_id, active_artist_id, path);
      }

      if (!fileRecord) {
        return {
          success: false,
          error: `File or directory '${fileName}' not found${path ? ` in '${path}'` : ""}.`,
          message: `Cannot delete - '${fileName}' does not exist. Use list_files to see available files.`,
        };
      }

      const storageKeysToDelete: string[] = [];
      const fileIdsToDelete: string[] = [];

      // 2. Handle directory deletion
      if (fileRecord.is_directory) {
        if (!recursive) {
          // Check if directory is empty
          const childFiles = await listFilesByArtist(
            active_account_id,
            active_artist_id,
            path ? `${path}/${fileName}` : fileName,
          );

          if (childFiles.length > 0) {
            return {
              success: false,
              error: `Directory '${fileName}' is not empty.`,
              message: `Cannot delete non-empty directory without recursive flag. Directory contains ${childFiles.length} file(s). Use recursive=true to delete directory and all contents.`,
            };
          }
        } else {
          // Recursive deletion: get all children WITHOUT deleting DB records yet
          const childFiles = await getFilesInDirectory(fileRecord.storage_key, fileRecord.id);

          // Collect storage keys and file IDs for later deletion
          childFiles.forEach(child => {
            storageKeysToDelete.push(child.storage_key);
            fileIdsToDelete.push(child.id);
          });
        }
      } else {
        // Regular file - add to deletion list
        storageKeysToDelete.push(fileRecord.storage_key);
      }

      // 3. Delete storage blobs first (before DB records)
      // This way, if storage deletion fails, DB records remain intact
      if (storageKeysToDelete.length > 0) {
        await deleteFileByKey(storageKeysToDelete);
      }

      // 4. Only after storage deletion succeeds, delete DB records
      // Delete child file records (if any)
      if (fileIdsToDelete.length > 0) {
        await deleteFileRecords(fileIdsToDelete);
      }

      // Delete the main file/directory record
      await deleteFileRecord(fileRecord.id);

      return {
        success: true,
        fileName,
        path: path || "root",
        isDirectory: fileRecord.is_directory,
        filesDeleted: storageKeysToDelete.length,
        message: fileRecord.is_directory
          ? `Successfully deleted directory '${fileName}' and ${storageKeysToDelete.length} file(s) inside it.`
          : `Successfully deleted file '${fileName}'.`,
      };
    } catch (error) {
      return handleToolError(error, "delete", fileName);
    }
  },
});

export default deleteFile;
