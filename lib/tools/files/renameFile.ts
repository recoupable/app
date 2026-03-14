import { z } from "zod";
import { tool } from "ai";
import { findFileByName } from "@/lib/supabase/files/findFileByName";
import { copyFileByKey } from "@/lib/supabase/storage/copyFileByKey";
import { deleteFileByKey } from "@/lib/supabase/storage/deleteFileByKey";
import { updateFileName } from "@/lib/supabase/files/updateFileName";
import { isValidFileName } from "@/utils/isValidFileName";
import { isValidPath } from "@/utils/isValidPath";
import { getFileExtension } from "@/lib/files/getFileExtension";
import { generateStorageKey } from "@/lib/files/generateStoragePath";
import { handleToolError } from "@/lib/files/handleToolError";
import { normalizeFileName } from "@/lib/files/normalizeFileName";

const renameFile = tool({
  description: `
Rename a file in storage. Use this to fix typos or improve file naming.

When to use:
- Fix typo in filename
- Update name for better clarity
- Standardize naming conventions

Important:
- File extension is ALWAYS preserved (renaming "old.pdf" to "new" becomes "new.pdf")
- New name must not already exist in the same directory
- File stays in same location (use move_file to change location)
- Special characters and path separators are not allowed
`,
  inputSchema: z.object({
    fileName: z.string().describe("Current name of the file (e.g., 'old-research.md')"),
    newFileName: z
      .string()
      .describe(
        "New name for the file (e.g., 'updated-research'). Do not include extension - it will be preserved automatically.",
      ),
    path: z
      .string()
      .optional()
      .describe("Optional subdirectory path where file is located (e.g., 'research', 'reports')"),
    active_account_id: z.string().describe("Pull active_account_id from the system prompt"),
    active_artist_id: z.string().describe("Pull active_artist_id from the system prompt"),
  }),
  execute: async ({ fileName, newFileName, path, active_account_id, active_artist_id }) => {
    const normalizedFileName = normalizeFileName(fileName);

    try {
      if (path && !isValidPath(path)) {
        return {
          success: false,
          error: "Invalid path provided.",
          message: `Path '${path}' is invalid.`,
        };
      }

      const fileRecord = await findFileByName(
        normalizedFileName,
        active_account_id,
        active_artist_id,
        path,
      );

      if (!fileRecord) {
        return {
          success: false,
          error: `File '${normalizedFileName}' not found.`,
          message: `Cannot rename - '${normalizedFileName}' does not exist.`,
        };
      }

      if (fileRecord.is_directory) {
        return {
          success: false,
          error: `'${normalizedFileName}' is a folder, not a file.`,
          message: "Use rename_folder to rename folders.",
        };
      }

      const extension = getFileExtension(normalizedFileName);
      const finalNewFileName =
        extension && !newFileName.endsWith(extension) ? newFileName + extension : newFileName;

      if (!isValidFileName(finalNewFileName)) {
        return {
          success: false,
          error: "Invalid new filename.",
          message: `Name '${finalNewFileName}' is invalid.`,
        };
      }

      const existingFile = await findFileByName(
        finalNewFileName,
        active_account_id,
        active_artist_id,
        path,
      );

      if (existingFile) {
        return {
          success: false,
          error: `'${finalNewFileName}' already exists.`,
          message: `Cannot rename - a file named '${finalNewFileName}' already exists.`,
        };
      }

      const newStorageKey = generateStorageKey(
        active_account_id,
        active_artist_id,
        finalNewFileName,
        path,
      );

      await copyFileByKey(fileRecord.storage_key, newStorageKey, fileRecord.mime_type || undefined);

      await updateFileName(fileRecord.id, finalNewFileName, newStorageKey);
      await deleteFileByKey(fileRecord.storage_key);

      return {
        success: true,
        oldName: normalizedFileName,
        newName: finalNewFileName,
        path: path || "root",
        storageKey: newStorageKey,
        message: `Successfully renamed file '${normalizedFileName}' to '${finalNewFileName}'.`,
      };
    } catch (error) {
      return handleToolError(error, "rename", normalizedFileName);
    }
  },
});

export default renameFile;
