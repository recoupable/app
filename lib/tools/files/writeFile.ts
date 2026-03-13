import { z } from "zod";
import { tool } from "ai";
import { findFileByName } from "@/lib/supabase/files/findFileByName";
import { uploadFileByKey } from "@/lib/supabase/storage/uploadFileByKey";
import { createFileRecord } from "@/lib/supabase/files/createFileRecord";
import { ensureDirectoryExists } from "@/lib/supabase/files/ensureDirectoryExists";
import { generateStorageKey } from "@/lib/files/generateStoragePath";
import { handleToolError } from "@/lib/files/handleToolError";
import { normalizeFileName } from "@/lib/files/normalizeFileName";

const writeFile = tool({
  description: `
Create a new file in storage with the provided content. Use this to save research, reports, notes, or any content for the user.

When to use:
- After conducting research, save findings to a file for the user
- Creating reports, summaries, or documentation
- Saving generated content (e.g., analysis results, recommendations)
- Storing structured data (JSON, CSV, etc.)

File Extension Guidelines:
- **JSON data** (objects, arrays, structured data) → Use .json extension (e.g., 'data.json', 'config.json')
- **CSV data** (tabular data, spreadsheets) → Use .csv extension (e.g., 'results.csv')
- **Text content** (notes, reports, documentation, markdown) → Use .md extension (e.g., 'notes.md', 'report.md')
- **Plain text** (logs, simple text) → Use .txt extension only for basic text files
- **Other formats** → Specify appropriate extension (.html, .xml, .yaml, etc.)

Default Behavior:
- Files WITHOUT an extension automatically get .md extension (e.g., 'notes' becomes 'notes.md')
- Prefer .md over .txt for general text content
- Choose the extension that best matches the content type

Important:
- Check if file already exists first using list_files or read_file
- Default path is root directory unless specified
`,
  inputSchema: z.object({
    fileName: z
      .string()
      .describe(
        "Name of the file to create. Choose extension based on content: .json for JSON data, .csv for tabular data, .md for text/documentation (preferred over .txt), or omit extension to default to .md. Examples: 'research', 'data.json', 'results.csv'",
      ),
    content: z.string().describe("The text content to write to the file"),
    mimeType: z
      .string()
      .optional()
      .describe(
        "MIME type of the file (e.g., 'text/plain', 'text/markdown', 'application/json'). Auto-detected if not provided.",
      ),
    path: z
      .string()
      .optional()
      .describe(
        "Optional subdirectory path where file should be created (e.g., 'research', 'reports')",
      ),
    description: z.string().optional().describe("Optional description of the file content"),
    active_account_id: z.string().describe("Pull active_account_id from the system prompt"),
    active_artist_id: z.string().describe("Pull active_artist_id from the system prompt"),
  }),
  execute: async ({
    fileName,
    content,
    mimeType,
    path,
    description,
    active_account_id,
    active_artist_id,
  }) => {
    const normalizedFileName = normalizeFileName(fileName);

    try {
      const existingFile = await findFileByName(
        normalizedFileName,
        active_account_id,
        active_artist_id,
        path,
      );

      if (existingFile) {
        return {
          success: false,
          error: `File '${normalizedFileName}' already exists${path ? ` in '${path}'` : ""}.`,
          message: `Cannot create file - '${normalizedFileName}' already exists. Use update_file to modify existing files, or choose a different name.`,
        };
      }

      if (path) {
        await ensureDirectoryExists(active_account_id, active_artist_id, path);
      }

      const storageKey = generateStorageKey(
        active_account_id,
        active_artist_id,
        normalizedFileName,
        path,
      );

      let detectedMimeType = mimeType;
      if (!detectedMimeType) {
        const ext = normalizedFileName.toLowerCase().split(".").pop();
        const mimeTypeMap: Record<string, string> = {
          txt: "text/plain",
          md: "text/markdown",
          json: "application/json",
          csv: "text/csv",
          xml: "application/xml",
          html: "text/html",
          yaml: "text/yaml",
          yml: "text/yaml",
          log: "text/plain",
        };
        detectedMimeType = mimeTypeMap[ext || ""] || "text/plain";
      }

      const blob = new Blob([content], { type: detectedMimeType });
      const file = new File([blob], normalizedFileName, { type: detectedMimeType });

      await uploadFileByKey(storageKey, file, {
        contentType: detectedMimeType,
        upsert: false,
      });

      const sizeBytes = new TextEncoder().encode(content).length;

      const fileRecord = await createFileRecord({
        ownerAccountId: active_account_id,
        artistAccountId: active_artist_id,
        storageKey,
        fileName: normalizedFileName,
        mimeType: detectedMimeType,
        sizeBytes,
        description,
      });

      return {
        success: true,
        storageKey,
        fileName: normalizedFileName,
        sizeBytes,
        mimeType: detectedMimeType,
        path: path || "root",
        fileId: fileRecord.id,
        message: `Successfully created file '${normalizedFileName}' (${sizeBytes} bytes)${path ? ` in '${path}'` : ""}.`,
      };
    } catch (error) {
      return handleToolError(error, "create file");
    }
  },
});

export default writeFile;
