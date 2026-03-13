import { z } from "zod";
import { tool } from "ai";
import { ensureDirectoryExists } from "@/lib/supabase/files/ensureDirectoryExists";
import { handleToolError } from "@/lib/files/handleToolError";
import { isValidFileName } from "@/utils/isValidFileName";
import { isValidPath } from "@/utils/isValidPath";

const createFolder = tool({
  description: `
Create a new folder/directory in storage. Use this to organize files into folders.

When to use:
- User asks to "create a folder" or "make a directory"
- Organizing related files into categories
- Setting up project structure

Note:
- Folders are also created automatically when you write files to paths
- Use this when you need an empty folder immediately
- Folder names should not contain special characters or slashes
`,
  inputSchema: z.object({
    folderName: z
      .string()
      .describe("Name of the folder to create (e.g., 'dailyweather', 'research')"),
    path: z
      .string()
      .optional()
      .describe("Optional parent directory path (e.g., 'projects', 'documents')"),
    active_account_id: z.string().describe("Pull active_account_id from the system prompt"),
    active_artist_id: z.string().describe("Pull active_artist_id from the system prompt"),
  }),
  execute: async ({ folderName, path, active_account_id, active_artist_id }) => {
    try {
      const trimmedFolderName = folderName.trim();

      if (!trimmedFolderName) {
        return {
          success: false,
          error: "Folder name cannot be empty.",
          message: "Please provide a valid folder name.",
        };
      }

      if (!isValidFileName(trimmedFolderName)) {
        return {
          success: false,
          error: "Invalid folder name.",
          message: `Folder name '${trimmedFolderName}' contains invalid characters. Folder names cannot contain path separators or special characters.`,
        };
      }

      // Validate and sanitize optional parent path
      let sanitizedPath: string | undefined;
      if (path) {
        sanitizedPath = path.trim();

        if (!isValidPath(sanitizedPath)) {
          return {
            success: false,
            error: "Invalid parent path.",
            message: `Parent path '${sanitizedPath}' contains invalid characters or path traversal patterns. Paths cannot contain "..", control characters, or absolute paths.`,
          };
        }
      }

      const fullPath = sanitizedPath ? `${sanitizedPath}/${trimmedFolderName}` : trimmedFolderName;

      await ensureDirectoryExists(active_account_id, active_artist_id, fullPath);

      return {
        success: true,
        folderName: trimmedFolderName,
        fullPath,
        message: `Successfully created folder '${trimmedFolderName}'${sanitizedPath ? ` in '${sanitizedPath}'` : ""}.`,
      };
    } catch (error) {
      return handleToolError(error, "create folder", folderName);
    }
  },
});

export default createFolder;
