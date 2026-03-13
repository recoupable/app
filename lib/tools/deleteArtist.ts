import { z } from "zod";
import { tool } from "ai";
import deleteArtistFromAccount from "@/lib/recoup/deleteArtistFromAccount";

/**
 * Interface for delete artist result
 */
export interface DeleteArtistResult {
  success: boolean;
  message: string;
  artistName?: string;
  error?: string;
}

const deleteArtist = tool({
  description: `
  Delete an artist account association. 
  This tool should be called when a user wants to remove an artist from their account.
  If no other user accounts have the artist associated, the artist account and all related data will be permanently deleted.
  If called without an artist_account_id parameter, it will use the active_artist_account_id from the conversation context.
  After calling this tool, reply with the result of the deletion.
  `,
  inputSchema: z.object({
    artist_account_id: z
      .string()
      .describe(
        "The ID of the artist to delete. If not provided, use the active artist_account_id.",
      ),
    account_id: z
      .string()
      .describe("The ID of the account that owns the artist. If not provided, use the account_id."),
  }),
  execute: async ({ artist_account_id, account_id }): Promise<DeleteArtistResult> => {
    try {
      // If no artist_account_id was provided, attempt to get the active artist
      // This would be handled by the AI when calling the tool
      if (!artist_account_id) {
        return {
          success: false,
          message: "No artist specified for deletion",
          error: "Missing artist_account_id parameter",
        };
      }

      // Call the API to delete the artist
      const response = await deleteArtistFromAccount(artist_account_id, account_id);

      if (!response.success) {
        return {
          success: false,
          message: "Failed to delete artist",
          error: response.message || "Unknown error",
        };
      }

      return {
        success: true,
        message: response.message || "Artist deleted successfully",
        artistName: response.artistName,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete artist for unknown reason";

      return {
        success: false,
        message: `Failed to delete artist: ${errorMessage}`,
        error: errorMessage,
      };
    }
  },
});

export default deleteArtist;
