import { z } from "zod";
import { tool } from "ai";
import { findFileByName } from "@/lib/supabase/files/findFileByName";
import { fetchFileContentServer } from "@/lib/supabase/storage/fetchFileContent";
import { handleToolError } from "@/lib/files/handleToolError";
import { normalizeFileName } from "@/lib/files/normalizeFileName";

const readFile = tool({
  description: `
Read the content of a file from storage. Use this to access existing files before updating them or to reference their content.
The file will be looked up within the current artist's storage directory.

When to use:
- Before updating a file, read it first to see current content
- To reference information stored in previous files
- To check if a file exists before creating a new one with the same name
`,
  inputSchema: z.object({
    fileName: z
      .string()
      .describe("The name of the file to read (e.g., 'research.md', 'notes.txt')"),
    path: z
      .string()
      .optional()
      .describe(
        "Optional subdirectory path within the artist's storage (e.g., 'research', 'reports')",
      ),
    active_account_id: z.string().describe("Pull active_account_id from the system prompt"),
    active_artist_id: z.string().describe("Pull active_artist_id from the system prompt"),
  }),
  execute: async ({ fileName, path, active_account_id, active_artist_id }) => {
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
          error: `File '${normalizedFileName}' not found${path ? ` in path '${path}'` : ""}.`,
          message: `Could not find file '${normalizedFileName}'. Use list_files to see available files.`,
        };
      }

      // Check if it's a directory
      if (fileRecord.is_directory) {
        return {
          success: false,
          error: `'${fileName}' is a directory, not a file.`,
          message: "Cannot read directory content. Use list_files to see files in this directory.",
        };
      }

      // Fetch the file content (server-side)
      const content = await fetchFileContentServer(fileRecord.storage_key);

      return {
        success: true,
        content,
        fileName: fileRecord.file_name,
        storageKey: fileRecord.storage_key,
        mimeType: fileRecord.mime_type,
        sizeBytes: fileRecord.size_bytes,
        createdAt: fileRecord.created_at,
        message: `Successfully read file '${fileName}' (${fileRecord.size_bytes || 0} bytes).`,
      };
    } catch (error) {
      return handleToolError(error, "read file", fileName);
    }
  },
});

export default readFile;
