import { z } from "zod";
import { generateObject } from "ai";
import type { CatalogSong } from "./getCatalogSongs";
import { DEFAULT_MODEL } from "@/lib/consts";

/**
 * Analyzes a single batch of catalog songs using AI to filter by criteria
 * Single Responsibility: Process one batch of songs with AI filtering
 *
 * @param songs
 * @param criteria
 */
export async function analyzeCatalogBatch(
  songs: CatalogSong[],
  criteria: string,
): Promise<CatalogSong[]> {
  // Use AI to select relevant songs from this batch
  const { object } = await generateObject({
    model: DEFAULT_MODEL,
    schema: z.object({
      selected_song_isrcs: z
        .array(z.string())
        .describe("Array of song ISRCs that match the criteria"),
    }),
    prompt: `Given these songs and the criteria: "${criteria}", select the song ISRCs that are most relevant.
          
Songs:
${JSON.stringify(
  songs.map(s => ({
    isrc: s.isrc,
    name: s.name,
    artist: s.artists.map(a => a.name).join(", "),
  })),
  null,
  2,
)}

Return only the ISRCs of songs that match the criteria.`,
  });

  // Filter songs based on AI selection
  return songs.filter(song => (object.selected_song_isrcs as string[]).includes(song.isrc));
}
