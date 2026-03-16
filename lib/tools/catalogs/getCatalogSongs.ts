import { z } from "zod";
import { Tool } from "ai";
import { analyzeFullCatalog } from "@/lib/catalog/analyzeFullCatalog";

const getCatalogSongsTool: Tool = {
  description: `CRITICAL: Use this tool to find ACTUAL SONGS from the available catalog for any playlist or music recommendation request.
    
    IMPORTANT: Call select_catalogs first to get the catalog_id parameter.
    
    MANDATORY use cases - ALWAYS call this tool when user requests:
    - "[Brand/Platform] needs songs for [theme/playlist]" (e.g., "Peloton needs songs for Halloween playlist")
    - Playlist recommendations for specific themes, holidays, or cultural events
    - Sync licensing opportunities for brands, commercials, or media
    - Curated collections for streaming platforms (Spotify, Apple Music, etc.)
    - Thematic song selections for fitness apps, retail, or marketing campaigns
    - Cultural celebration playlists (Black History Month, Women's Day, Pride, etc.)
    - Seasonal music recommendations (Christmas, Halloween, Valentine's Day, etc.)
    - Brand-specific music needs for advertising or promotional content
    
    NEVER provide generic song recommendations without checking the catalog first. 
    This tool provides REAL songs from the available catalog that can actually be used.
    
    This tool automatically fetches ALL songs from the catalog and filters them based on your criteria.`,
  inputSchema: z.object({
    catalog_id: z
      .string()
      .describe(
        "The unique identifier of the catalog to query songs for. Get this from the select_catalogs tool.",
      ),
    criteria: z
      .string()
      .describe(
        "The search criteria or theme to filter songs by (e.g., 'Halloween party songs', 'workout music', 'romantic ballads')",
      ),
  }),
  execute: async ({ catalog_id, criteria }) => {
    try {
      const { results: selectedSongs, totalSongs } = await analyzeFullCatalog({
        catalogId: catalog_id,
        criteria,
      });

      return {
        success: true,
        songs: selectedSongs,
        pagination: {
          total_count: totalSongs,
          page: 1,
          limit: selectedSongs.length,
          total_pages: 1,
        },
        total_added: selectedSongs.length,
        message: `Found ${selectedSongs.length} song(s) matching "${criteria}"`,
      };
    } catch (error) {
      console.error("Error fetching catalog songs:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch catalog songs",
        songs: [],
        total_added: 0,
      };
    }
  },
};

export default getCatalogSongsTool;
