import Papa from "papaparse";
import { CatalogSongInput } from "./postCatalogSongs";
import { TablesInsert } from "@/types/database.types";
import { parseCommaSeparated } from "./parseCommaSeparated";

type ParsedRow = Partial<TablesInsert<"songs">> & {
  artists?: string;
};

/**
 * Parses a CSV file containing catalog songs using papaparse for robust parsing
 * Required columns: isrc (case-insensitive)
 * Optional columns: name, album, notes, artists (case-insensitive)
 * catalog_id is provided as a parameter
 *
 * Handles quoted fields, escaped quotes, and multiline cells correctly
 *
 * @param text
 * @param catalogId
 */
export function parseCsvFile(text: string, catalogId: string): CatalogSongInput[] {
  // Parse CSV using papaparse with optimized configuration
  const parseResult = Papa.parse<ParsedRow>(text, {
    header: true, // Automatically parse as objects with field names as keys
    skipEmptyLines: "greedy", // Skip lines with only whitespace
    transformHeader: (header: string) => header.trim().toLowerCase(), // Normalize headers
    transform: (value: string) => value.trim(), // Trim all values
  });

  // Check for critical parsing errors
  const criticalErrors = parseResult.errors.filter(
    e => e.type === "Delimiter" || e.type === "FieldMismatch",
  );
  if (criticalErrors.length > 0) {
    throw new Error(`CSV parsing errors: ${criticalErrors.map(e => e.message).join(", ")}`);
  }

  const rows = parseResult.data;
  if (rows.length === 0) {
    throw new Error("CSV file must contain at least one data row");
  }

  // Validate ISRC column exists
  if (!parseResult.meta.fields?.includes("isrc")) {
    throw new Error("CSV must contain an 'isrc' column (case-insensitive)");
  }

  // Transform parsed rows into CatalogSongInput objects
  const songs: CatalogSongInput[] = [];
  for (const row of rows) {
    // Skip rows without ISRC
    if (!row.isrc) {
      continue;
    }

    const artistsArray = parseCommaSeparated(row.artists);

    songs.push({
      catalog_id: catalogId,
      isrc: row.isrc,
      name: row.name || undefined,
      album: row.album || undefined,
      notes: row.notes || undefined,
      artists: artistsArray.length > 0 ? artistsArray : undefined,
    });
  }

  if (songs.length === 0) {
    throw new Error("No valid songs found in CSV file");
  }

  return songs;
}
