import { z } from "zod";
import { tool } from "ai";
import { findFileByName } from "@/lib/supabase/files/findFileByName";
import { uploadFileByKey } from "@/lib/supabase/storage/uploadFileByKey";
import { updateFileSizeBytes } from "@/lib/supabase/files/updateFileSizeBytes";
import { fetchFileContentServer } from "@/lib/supabase/storage/fetchFileContent";
import { normalizeContent } from "@/lib/utils/normalizeContent";
import { handleToolError } from "@/lib/files/handleToolError";
import { normalizeFileName } from "@/lib/files/normalizeFileName";

const updateFile = tool({
  description: `
Update the content of an existing file in storage. Use this to modify, enhance, or iterate on files you previously created.

When to use:
- User asks to "add more detail" or "expand on" existing file
- Updating research findings with new information
- Fixing or improving content in existing files
- Iterating on reports, notes, or documentation

Important:
- File must already exist (use write_file to create new files)
- This will overwrite the current content completely
- Specify fileName and optionally path to locate the file
`,
  inputSchema: z.object({
    fileName: z.string().describe("Name of the file to update (e.g., 'research.md', 'report.txt')"),
    newContent: z.string().describe("The new content that will replace the current file content"),
    path: z
      .string()
      .optional()
      .describe("Optional subdirectory path where file is located (e.g., 'research', 'reports')"),
    active_account_id: z.string().describe("Pull active_account_id from the system prompt"),
    active_artist_id: z.string().describe("Pull active_artist_id from the system prompt"),
  }),
  execute: async ({ fileName, newContent, path, active_account_id, active_artist_id }) => {
    const normalizedFileName = normalizeFileName(fileName);

    try {
      const fileRecord = await findFileByName(
        normalizedFileName,
        active_account_id,
        active_artist_id,
        path,
      );

      if (!fileRecord) {
        return {
          success: false,
          error: `File '${normalizedFileName}' not found${path ? ` in '${path}'` : ""}.`,
          message: `Cannot update file - '${normalizedFileName}' does not exist. Use write_file to create new files.`,
        };
      }

      if (fileRecord.is_directory) {
        return {
          success: false,
          error: `'${normalizedFileName}' is a directory, not a file.`,
          message: "Cannot update directory. Only files can be updated.",
        };
      }

      const currentContent = await fetchFileContentServer(fileRecord.storage_key);

      const normalizedCurrent = normalizeContent(currentContent);
      const normalizedNewPreUpload = normalizeContent(newContent);

      if (normalizedCurrent === normalizedNewPreUpload) {
        return {
          success: false,
          noChange: true,
          error: "Content is identical to existing file.",
          message: `No update needed - '${normalizedFileName}' already contains this exact content.`,
        };
      }

      const blob = new Blob([newContent], {
        type: fileRecord.mime_type || "text/plain",
      });
      const file = new File([blob], normalizedFileName, {
        type: fileRecord.mime_type || "text/plain",
      });

      await uploadFileByKey(fileRecord.storage_key, file, {
        contentType: fileRecord.mime_type || "text/plain",
        upsert: true,
      });

      // Wait for Supabase Storage cache to update before verifying
      await new Promise(resolve => setTimeout(resolve, 300));

      const updatedContent = await fetchFileContentServer(fileRecord.storage_key);

      const normalizedUpdated = normalizeContent(updatedContent);
      const normalizedNew = normalizeContent(newContent);

      if (normalizedUpdated !== normalizedNew) {
        return {
          success: false,
          verified: false,
          error: "File content does not match what was uploaded.",
          message: `Update verification failed - '${normalizedFileName}' was modified but doesn't contain the expected content. Found ${updatedContent.length} bytes instead of expected ${newContent.length} bytes.`,
          suggestion:
            "Read the current file content to see what it contains, then retry the update.",
        };
      }

      const newSizeBytes = new TextEncoder().encode(updatedContent).length;
      await updateFileSizeBytes(fileRecord.id, newSizeBytes);

      return {
        success: true,
        verified: true,
        storageKey: fileRecord.storage_key,
        fileName: normalizedFileName,
        sizeBytes: newSizeBytes,
        path: path || "root",
        message: `Successfully updated and verified '${normalizedFileName}' (${newSizeBytes} bytes).`,
      };
    } catch (error) {
      return handleToolError(error, "update file", normalizedFileName);
    }
  },
});

export default updateFile;
