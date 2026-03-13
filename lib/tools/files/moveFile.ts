import { z } from "zod";
import { tool } from "ai";
import { findFileByName } from "@/lib/supabase/files/findFileByName";
import { ensureDirectoryExists } from "@/lib/supabase/files/ensureDirectoryExists";
import { copyFileByKey } from "@/lib/supabase/storage/copyFileByKey";
import { deleteFileByKey } from "@/lib/supabase/storage/deleteFileByKey";
import { updateFileStorageKey } from "@/lib/supabase/files/updateFileStorageKey";
import isValidStorageKey from "@/utils/isValidStorageKey";
import { generateStoragePath, generateStorageKey } from "@/lib/files/generateStoragePath";
import { handleToolError } from "@/lib/files/handleToolError";
import { normalizeFileName } from "@/lib/files/normalizeFileName";

const moveFile = tool({
  description: `
Move a file from one directory to another. Use this to reorganize files into proper folders.

When to use:
- Organize files into category folders
- Move research into a dedicated reports folder
- Restructure file organization
- Consolidate related files into one location

Important:
- V1 supports files only (not directories)
- Target directory must be specified (cannot move to root if already there)
- File keeps the same name (use rename_file_or_folder to change name)
- Target file cannot already exist
`,
  inputSchema: z.object({
    fileName: z.string().describe("Name of the file to move (e.g., 'research.md')"),
    sourcePath: z
      .string()
      .optional()
      .describe(
        "Current directory path (e.g., 'old-folder'). Leave empty if file is in root directory.",
      ),
    targetPath: z
      .string()
      .describe("Destination directory path (e.g., 'reports', 'research/2024'). Cannot be empty."),
    active_account_id: z.string().describe("Pull active_account_id from the system prompt"),
    active_artist_id: z.string().describe("Pull active_artist_id from the system prompt"),
  }),
  execute: async ({ fileName, sourcePath, targetPath, active_account_id, active_artist_id }) => {
    const normalizedFileName = normalizeFileName(fileName);

    try {
      const fileRecord = await findFileByName(
        normalizedFileName,
        active_account_id,
        active_artist_id,
        sourcePath,
      );

      if (!fileRecord) {
        return {
          success: false,
          error: `File '${normalizedFileName}' not found${sourcePath ? ` in '${sourcePath}'` : " in root directory"}.`,
          message: `Cannot move - '${normalizedFileName}' does not exist. Use list_files to see available files.`,
        };
      }

      if (fileRecord.is_directory) {
        return {
          success: false,
          error: `'${normalizedFileName}' is a directory.`,
          message: "Directory moving is not supported in V1. Only files can be moved.",
        };
      }

      if (!targetPath || targetPath.trim() === "") {
        return {
          success: false,
          error: "Target path cannot be empty.",
          message:
            "Please specify a destination directory. Use rename_file_or_folder if you want to keep the file in the same location.",
        };
      }

      const fullTargetPath = generateStoragePath(active_account_id, active_artist_id, targetPath);

      if (!isValidStorageKey(fullTargetPath)) {
        return {
          success: false,
          error: "Invalid target path.",
          message: `Target path '${targetPath}' contains invalid characters or patterns. Paths cannot contain '..' or start with '/'.`,
        };
      }

      const normalizedSourcePath = sourcePath?.trim() || "";
      const normalizedTargetPath = targetPath.trim();

      if (normalizedSourcePath === normalizedTargetPath) {
        return {
          success: false,
          error: "Source and target paths are the same.",
          message: `File '${normalizedFileName}' is already in '${targetPath}'. No move needed.`,
        };
      }

      await ensureDirectoryExists(active_account_id, active_artist_id, targetPath);

      const existingFile = await findFileByName(
        normalizedFileName,
        active_account_id,
        active_artist_id,
        targetPath,
      );

      if (existingFile) {
        return {
          success: false,
          error: `File '${normalizedFileName}' already exists in target directory.`,
          message: `Cannot move - a file named '${normalizedFileName}' already exists in '${targetPath}'. Rename the file first or choose a different target directory.`,
        };
      }

      const newStorageKey = generateStorageKey(
        active_account_id,
        active_artist_id,
        normalizedFileName,
        targetPath,
      );

      await copyFileByKey(fileRecord.storage_key, newStorageKey, fileRecord.mime_type || undefined);

      await updateFileStorageKey(fileRecord.id, newStorageKey);
      await deleteFileByKey(fileRecord.storage_key);

      return {
        success: true,
        fileName: normalizedFileName,
        sourcePath: sourcePath || "root",
        targetPath,
        storageKey: newStorageKey,
        message: `Successfully moved '${normalizedFileName}' from '${sourcePath || "root"}' to '${targetPath}'.`,
      };
    } catch (error) {
      return handleToolError(error, "move", normalizedFileName);
    }
  },
});

export default moveFile;
