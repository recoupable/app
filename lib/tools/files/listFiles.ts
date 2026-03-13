import { z } from "zod";
import { tool } from "ai";
import { TEXT_EXTENSIONS } from "@/lib/consts/fileExtensions";
import { listFilesByArtist } from "@/lib/supabase/files/listFilesByArtist";
import { handleToolError } from "@/lib/files/handleToolError";

const listFiles = tool({
  description: `
List files in storage for the current artist. Use this to discover what files exist before reading or updating them.

When to use:
- Before creating a new file, check if it already exists
- To show the customer what files are available
- To find files matching a pattern or in a specific directory
- Before reading a file, to confirm it exists and get its exact name
`,
  inputSchema: z.object({
    path: z
      .string()
      .optional()
      .describe(
        "Optional subdirectory path to list files from (e.g., 'research', 'reports'). Defaults to root directory.",
      ),
    textFilesOnly: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "If true, only return text-based files (md, txt, json, etc). If false, return all files.",
      ),
    active_account_id: z.string().describe("Pull active_account_id from the system prompt"),
    active_artist_id: z.string().describe("Pull active_artist_id from the system prompt"),
  }),
  execute: async ({ path, textFilesOnly, active_account_id, active_artist_id }) => {
    try {
      // Query files directly from database (server-side)
      let files = await listFilesByArtist(active_account_id, active_artist_id, path);

      // Filter to text files only if requested
      if (textFilesOnly && files.length > 0) {
        files = files.filter(file => {
          // Keep directories (for navigation)
          if (file.is_directory) return true;

          // Check if file has a text extension
          return TEXT_EXTENSIONS.some(ext => file.file_name.toLowerCase().endsWith(ext));
        });
      }

      return {
        success: true,
        files: files,
        count: files.length,
        path: path || "root",
        textFilesOnly,
        message: `Found ${files.length} ${textFilesOnly ? "text " : ""}file(s)${path ? ` in '${path}'` : ""}.`,
      };
    } catch (error) {
      const result = handleToolError(error, "list files");
      return {
        ...result,
        files: [],
        count: 0,
      };
    }
  },
});

export default listFiles;
